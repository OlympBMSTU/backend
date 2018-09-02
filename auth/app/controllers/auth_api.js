
const express = require('express');
const router = express.Router();
const db = require('../models');
const crypto = require('crypto');

const authToken = require('../authToken.js')
const reCaptcha = require('../recaptcha.js')

const tokenLiveTime = 86400; // время жизни общее токена интерфейса 24 часа

module.exports = (app) => {
  app.use('/', router);
};

router.post('/register', (req, res, next) => {

	let login = req.body.login;
	if (!login) return res.status(200).send({res_code: "INVALID", res_data: "login", res_msg: "Заполните все поля"});

	let password = req.body.password;
	if (!password) return res.status(200).send({res_code: "INVALID", res_data: "password", res_msg: "Заполните все поля"});

	let email = req.body.email;
	if (!email) return res.status(200).send({res_code: "INVALID", res_data: "email", res_msg: "Заполните все поля"});

	let captcha = req.body['g-recaptcha-response'];
	
	if (!captcha) {
		return res.status(200).send({res_code: "INVALID", res_data: req.body, res_msg: "Заполните все поля"});
	} else {
		reCaptcha.check(captcha, function (captchaReqErr, captchaReqRes) {
			if (captchaReqErr) {
				return res.status(200).send({res_code: "CAPTCHA_ERROR", res_data: captchaReqErr, res_msg: "Произошла ошибка во время проверки reCaptcha"} );
			} else if (!captchaReqRes) {
				return res.status(200).send({res_code: "CAPTCHA_INVALID", res_data: captchaReqRes, res_msg: "reCaptcha не прошла проверку"} );
			}

			db.Account.createAccount(login, password, email, function (err, account) {
				console.log(err);
				if (!err) {
					return res.status(200).send({res_code: "OK", res_data: login, res_msg: "Вы успешно зарегистрированны"} );
				} else if (err.name === "SequelizeUniqueConstraintError") {
					return res.status(200).send( {res_code: "NOT_UNIQUE", res_data: "", res_msg: "Пользователь с таким логином или почтой уже существует"} );
				} else {
					return res.status(500).send( {res_code: "INTERNAL_ERROR", res_data: "", res_msg: "Произошла внутренняя ошибка"} );
				}
			});
		});
	}
});

router.post('/login', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');

	let login = req.body.login;
	if (!login) return res.status(200).send({res_code: "INVALID", res_data: "login", res_msg: "Заполните все поля"});

	let password = req.body.password;
	if (!password) return res.status(200).send({res_code: "INVALID", res_data: "password", res_msg: "Заполните все поля"});

	db.Account.findAccountAndCheckPassword(login, password, function (err, account) {
		console.log(err);
		if (!err) {
			let token = authToken.encodeJWT(account.id, account.type);
			return res.status(200).send({res_code: "OK", res_data: token, res_msg: "Вы успешно авторизованны"} );
		} else if (err.name === 'SequelizeEmptyResultError') {
			return res.status(200).send( {res_code: "NOT_FOUND", res_data: "", res_msg: "Пользователь с таким логином не найден"} );
		} else if (err.name === 'IncorrectPasswordError') {
			return res.status(200).send( {res_code: "INVALID_PASS", res_data: "", res_msg: "Неверный пароль"} );
		} else {
			return res.status(500).send( {res_code: "INTERNAL_ERROR", res_data: "", res_msg: "Произошла внутренняя ошибка"} );
		}
	});
});

router.get('/info', (req, res, next) => {
	console.log('info');
	cookie = req.cookies.bmstuOlimpAuth;

	if (!cookie) return res.status(401).send( {res_code: "NO_TOKEN", res_data: cookie, res_msg: "Вы не авторизованны"} );

	jwtFromToken = authToken.decodeJWT(cookie);

	if (jwtFromToken.res != 'OK') return res.status(401).send( {res_code: "INVALID_TOKEN", res_data: jwtFromToken.res, res_msg: "Неверные данные авторизации"} );
	console.log('decodedJWT', jwtFromToken.jwt);

	let id = jwtFromToken.jwt.payload.id;

	db.Account.getInfo(id, function (err, account) {
		console.log(account);
		if (!err) {
			return res.status(200).send({res_code: "OK", res_data: account, res_msg: "Краткая информация об аккаунте"} );
		} else if (err.name === 'SequelizeEmptyResultError') {
			return res.status(200).send( {res_code: "NOT_FOUND", res_data: "", res_msg: "Пользователь с таким логином не найден"} );
		} else {
			return res.status(500).send( {res_code: "INTERNAL_ERROR", res_data: "", res_msg: "Произошла внутренняя ошибка"} );
		}
	});
});

router.post('/findtokenbyid', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');
	
	let data = req.body.data;
	db.UIToken.findTokenById(data, function (tokenErr, token) {
		if (tokenErr) {
			return res.status(500).send({error: "Service unavailable", ex: tokenErr});
		} else {
			return res.status(200).send({token: token});
		}
	});
});

router.post('/findtokenbytoken', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');
	
	let data = req.body.data;
	db.UIToken.findToken(data, function (tokenErr, token) {
		if (tokenErr) {
			return res.status(500).send({error: "Service unavailable", ex: tokenErr});
		} else {
			return res.status(200).send({token: token});
		}
	});
});

router.post('/calctoken', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');
	
	let data = Date.now().toString();
	let token =  crypto.createHmac('sha256', 'hashSecret').update(data).digest("hex");

	return res.status(200).send({token: token});
});

router.post('/return', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');
	
	let token = 'arnold';

	return res.status(200).send({token: token});
});

router.post('/check/:id', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for token check for '+req.params.id);
	
	let userId = req.params.id;
	if (typeof(userId) == 'undefined') return res.status(400).send({error: "userId not specified", errCode:400});
	
	let token = req.body.token;
	if (typeof(token) == 'undefined') return res.status(400).send({error: "token not specified", errCode:400});
	
	console.log('TokBeforeCheck:' + token +'|');
	db.UIToken.findToken(token, function (err, dbToken) {
		if (err) {
			if (err == 'SequelizeEmptyResultError') {
				console.log('tnf');
				return res.status(200).send({error: "TokenNotFound", errCode:401});
			} else {
				console.log("dbErr:"+err);
				return res.status(500).send({error: "Service unavailable", errCode:500});
			}
		} else {
			if (dbToken.userId != userId) {
				console.log('tau');
				return res.status(200).send({error: "Trying affect another user", errCode:403});
			} else if ((Date.now() - dbToken.created)/1000 > tokenLiveTime) {
				console.log('ttl');
				return res.status(200).send({error: 'TokenTTL', errCode:401});
			} else if ((Date.now() - dbToken.lastUsed)/1000 > inactiveTokenLiveTime) {
				console.log('til');
				return res.status(200).send({error: 'TokenInactive', errCode:401});
			} else {
				db.UIToken.updateLastUsed(token, function (err, data) {
					console.log('good');
					return res.status(200).send({result: 1});
				});
			}
		}
	});
});