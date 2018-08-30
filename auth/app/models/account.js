const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const hashSecret = '21477 61225 37 7836 29 2364? 32 575 784 9383.';

module.exports = (sequelize, DataTypes) => {

	const Account = sequelize.define('Account', {
		login: { type: DataTypes.STRING, unique: true },
		password: { type: DataTypes.STRING },
		email: { type: DataTypes.STRING, unique: true },
		type: { type: DataTypes.INTEGER, defaultValue: 0 },
		isFull: { type: DataTypes.BOOLEAN, defaultValue: false },
	},{ timestamps: false });
	
	Account.hashedPassword = function (password) {
		return crypto.createHmac('sha256', hashSecret).update(password).digest("hex");
	}
	
	Account.createAccount = function (login, password, email, callback) {
    let phash = Account.hashedPassword(password);
		this.create({
			login: login, 
			email: email, 
			password: phash, 
			type: 0,
			isFull: false		  
		}).then((account) => {
			callback(null, account);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	Account.findAccountAndCheckPassword = function (login, password, callback) {
		this.findOne(
		{
			where: { login: login },
			attributes: ['id','login','password','type'],
			rejectOnEmpty: true
		}
		).then((user) => {
			if (Account.hashedPassword(password) === user.password) {
				callback(null, user);
			} else {
				throw ({name: 'IncorrectPasswordError'});
			}
		}).catch(function (err) {
			callback(err, null);
		});
	}

	Account.getInfo = function (id, callback) {
		this.findById(id,
			{
				attributes: ['login','email','type'],
				rejectOnEmpty: true
			}
		).then((account) => {
			console.log('db', account);
			callback(null, account);
		}).catch(function (err) {
			callback(err, null);
		});	
	}
	
	return Account;
};

