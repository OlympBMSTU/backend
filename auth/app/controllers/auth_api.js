const express = require('express');
const router = express.Router();
const db = require('../models');

const crypto = require('crypto');

const interserverAuth = require('./../interserver');

var aggregationServAuth = {appId: "aggr", appSecret: "aggrKey", token: null, tokenDate: null};

const tokenLiveTime = 86400; // время жизни общее токена интерфейса 24 часа
const inactiveTokenLiveTime = 60; // время жизни неиспользуемого токена интерфейса 60сек

const codeTTL = 60; // Время жизни кода 60 сек

const accessTokenTTL = 60; // Время жизни accessToken 60 сек
const refreshTokenTTL = 86400; // Время жизни accessToken 24 часа

module.exports = (app) => {
  app.use('/', router);
};

router.get('/auth', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for auth');
	
	let appId = req.query.appId;
	
	let appSecret = req.query.appSecret;
	
	if (appId != aggregationServAuth.appId || appSecret != aggregationServAuth.appSecret)
	{
		res.status(401).send({error: 'appId or appSecret incorrect'});
	} else {
		aggregationServAuth.token = crypto.randomBytes(32).toString('base64');
		aggregationServAuth.tokenDate = Date.now();
		res.status(200).send({token: aggregationServAuth.token});
	}
});

router.post('/authenticate', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for authenticate');
	
	let authHeader = req.get('authorization');
	let checkErr = interserverAuth.authCheck(authHeader, aggregationServAuth);
	if (checkErr) {
		return res.status(401).send({error: checkErr});
	}
	
	let login = req.body.login;
	console.log('login:'+login+';');
	if (typeof(login) == 'undefined') return res.status(400).send({error: "Login not specified"});
	
	let password = req.body.password;
	console.log('pass:'+password+';');
	if (typeof(password) == 'undefined') return res.status(400).send({error: "Password not specified"});
	
	db.Account.findAccountAndCheckPassword(login, password, function (err, account) {
		if (err) {
			if (err == 'SequelizeEmptyResultError') {
				return res.status(200).send({error: "User with such login not found", errCode:404});
			} else if (err == 'Incorrect password') {
				return res.status(200).send({error: "Wrong password", errCode:401});
			} else {
				return res.status(500).send({error: "Service unavailable", errCode:500});
			}
		} else {
			db.UIToken.createToken(account.id, function (tokenErr, token) {
				if (tokenErr) {
					return res.status(500).send({error: "Service unavailable"});
				} else {
					return res.status(200).send({user: account.id, token: token.token});
				}
			});
		}
	});
});

router.post('/check/:id', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for token check for '+req.params.id);
	
	let authHeader = req.get('authorization');
	let checkErr = interserverAuth.authCheck(authHeader, aggregationServAuth);
	if (checkErr) {
		return res.status(401).send({error: checkErr});
	}
	
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

router.post('/check_token/:id', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for oauth token check for '+req.params.id);
	
	let authHeader = req.get('authorization');
	let checkErr = interserverAuth.authCheck(authHeader, aggregationServAuth);
	if (checkErr) {
		return res.status(401).send({error: checkErr});
	}
	
	let userId = req.params.id;
	if (typeof(userId) == 'undefined') return res.status(400).send({error: "userId not specified", errCode:400});
	
	let token = req.body.token;
	if (typeof(token) == 'undefined') return res.status(400).send({error: "token not specified", errCode:400});
	
	console.log('TokBeforeCheck:' + token +'|');
	db.OAToken.accessToken(token, function (err, dbToken) {
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
			} else if ((Date.now() - dbToken.created)/1000 > accessTokenTTL) {
				console.log('til');
				return res.status(200).send({error: 'accessTokenExpericed', errCode:401});
			} else {
				return res.status(200).send({result: 1});
			}
		}
	});
});

router.post('/code', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for code for OAuth');
	
	let authHeader = req.get('authorization');
	let checkErr = interserverAuth.authCheck(authHeader, aggregationServAuth);
	if (checkErr) {
		return res.status(401).send({error: checkErr});
	}
	
	let login = req.body.login;
	console.log('login:'+login+';');
	if (typeof(login) == 'undefined') return res.status(400).send({error: "Login not specified"});
	
	let password = req.body.password;
	console.log('pass:'+password+';');
	if (typeof(password) == 'undefined') return res.status(400).send({error: "Password not specified"});
	
	let appId = req.query.client_id;
	console.log('app='+appId);
	db.Account.findAccountAndCheckPassword(login, password, function (accountErr, account) {
		if (accountErr) {
			if (accountErr == 'SequelizeEmptyResultError') {
				return res.status(200).send({error: "User with such login not found", errCode:404});
			} else if (accountErr == 'Incorrect password') {
				return res.status(200).send({error: "Wrong password", errCode:401});
			} else {
				return res.status(500).send({error: "Service unavailable", errCode:500});
			}
		} else {
			db.App.findApp(appId, function (appErr, app) {
				console.log(appErr);
				db.Code.createCode(account.id, app.id, function (codeErr, code) {
					return res.status(200).send({code: code.code});
				});
			});
		}
	});
});


router.post('/token', (req, res, next) => {
	console.log('***\n\n' + new Date() + ':\n' + 'Got request for code for OAuth');
	
	let authHeader = req.get('authorization');
	let checkErr = interserverAuth.authCheck(authHeader, aggregationServAuth);
	if (checkErr) {
		return res.status(401).send({error: checkErr});
	}
	
	let appId = req.query.client_id;
	let appSecret = req.query.client_secret;
	
	let grant_type = req.body.grant_type;
	if (typeof(grant_type) == 'undefined') return res.status(400).send({error: "grant_type not specified"});
	
	if (grant_type == 'code') {
		let code = req.body.code;
		if (typeof(code) == 'undefined') return res.status(400).send({error: "Code not specified"});
		
		db.App.findApp(appId, function (appErr, app) {
			console.log(appErr);
			
			if (app.appSecret != appSecret)  return res.status(401).send({error: "WrongAppSecret", errCode:401});
			
			db.Code.findCode(code, function (codeErr, code) {
				console.log(codeErr);
				if (app.id != code.appId)  return res.status(401).send({error: "codeNotForThatApp", errCode:403});
				
				if ((Date.now() - code.created)/1000 > codeTTL) {
					return res.status(200).send({error: 'codeExpericed', errCode:401});
				}
				
				db.OAToken.createToken(code.userId, code.appId, function (oaTokenErr, oaToken) {
					console.log(oaTokenErr);
					
					return res.status(200).send({access_token: oaToken.accessToken, token_type: "bearer", refresh_token: oaToken.refreshToken});
				});
			});
		}); 
		
		
			
	} else if (grant_type == 'token') {
		let token = req.body.token;
		if (typeof(token) == 'undefined') return res.status(400).send({error: "token not specified"});
		
		db.OAToken.refreshToken(token, function (oaTokenErr, oaToken) {
			console.log(oaTokenErr);
			
			if (oaTokenErr) {
				if (oaTokenErr == 'SequelizeEmptyResultError') return res.status(200).send({error: "tokenNotFound", errCode: 401});
			}
			
			if ((Date.now() - oaToken.created)/1000 > refreshTokenTTL) {
				return res.status(200).send({error: 'TokenExpericed', errCode:401});
			} else
			{
				db.OAToken.byRefreshToken(token, function (newOaTokenErr, newOaToken) {
					console.log(newOaTokenErr);
					return res.status(200).send({access_token: newOaToken.accessToken, token_type: "bearer", refresh_token: newOaToken.refreshToken});
				});
			}
		});
		
	} else {
		return res.status(400).send({error: "bad grant_type"});
	}
});