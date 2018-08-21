const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {

	const Code = sequelize.define('Code', {
		code: DataTypes.STRING,
		userId: DataTypes.INTEGER,
		appId: DataTypes.INTEGER,
		created: DataTypes.DATE
	},{ timestamps: false }
	);
	
	Code.findCode = function (code, callback) {
		this.findOne(
		{
			where: { code: code },
			rejectOnEmpty: true
		}
		).then((code) => {
			callback(null, code);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	Code.createCode = function (userId, appId, callback) {
		this.create({
			code: crypto.randomBytes(32).toString('base64'),
			userId: userId,
			appId: appId,
			created: Date.now()
		}).then((code) => {
			callback(null, code);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	return Code;
};
