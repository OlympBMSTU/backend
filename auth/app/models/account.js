const crypto = require('crypto');
const Op = sequelize.Op;

const hashSecret = '21477 61225 37 7836 29 2364? 32 575 784 9383.';

module.exports = (sequelize, DataTypes) => {

	const Account = sequelize.define('Account', {
		login: DataTypes.STRING,
		password: DataTypes.STRING,
		email: DataTypes.STRING
	});
	
	Account.hashedPassword = function (password) {
		return crypto.createHmac('sha256', hashSecret).update(password).digest("hex");
	}
	
	Account.createAccount = function (login, password, email, callback) {
    let phash = Account.hashedPassword(password);
		this.findOrCreate({ where: { [Op.or]: [{login: login}, {email: email}] }, defaults: { password: phash, email: email }
                      })
  		.spread((user, created) => {
			if (created) {
				callback(null, user);
			} else {
				let notUnique = 0;
				if (user.login == login) notUnique = notUnique + 1;
				if (user.email == email) notUnique = notUnique - 1;

				callback("NOT UNIQUE", notUnique);
			}
		}).catch(function (err) {
			callback(err, null);
		});
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

