const crypto = require('crypto');
const hashSecret = '21477 61225 37 7836 29 2364? 32 575 784 9383.';

module.exports = (sequelize, DataTypes) => {

	const Account = sequelize.define('Account', {
		login: DataTypes.STRING,
		password: DataTypes.STRING
	});
	
	Account.hashedPassword = function (password) {
		return crypto.createHmac('sha256', hashSecret).update(password).digest("hex");
	}
	
	Account.findAccountAndCheckPassword = function (login, password, callback) {
		this.findOne(
		{
			where: { login: login },
			attributes: ['id','login','password'],
			rejectOnEmpty: true
		}
		).then((user) => {
			if (Account.hashedPassword(password) === user.password) {
				callback(null, user);
			} else {
				throw ('Incorrect password');
			}
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	return Account;
};

