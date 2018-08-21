const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {

	const OAToken = sequelize.define('OAToken', {
		accessToken: DataTypes.STRING,
		refreshToken: DataTypes.STRING,
		userId: DataTypes.INTEGER,
		appId: DataTypes.INTEGER,
		created: DataTypes.DATE
	},{ timestamps: false }
	);
	
	OAToken.accessToken = function (token, callback) {
		this.findOne(
		{
			where: { accessToken: token },
			rejectOnEmpty: true
		}
		).then((token) => {
			callback(null, token);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	OAToken.refreshToken = function (token, callback) {
		this.findOne(
		{
			where: { refreshToken: token },
			rejectOnEmpty: true
		}
		).then((token) => {
			callback(null, token);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	OAToken.createToken = function (userId, appId, callback) {
		this.create({
			accessToken: crypto.randomBytes(32).toString('base64'),
			refreshToken: crypto.randomBytes(32).toString('base64'),
			userId: userId,
			appId: appId,
			created: Date.now()
		}).then((token) => {
			callback(null, token);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	OAToken.byRefreshToken = function (token, callback) {
		this.findOne(
		{
			where: { refreshToken: token },
			rejectOnEmpty: true
		}
		).then((token) => {
			let uId = token.userId;
			let aId = token.appId;
			token.destroy();
			
			this.create({
				accessToken: crypto.randomBytes(32).toString('base64'),
				refreshToken: crypto.randomBytes(32).toString('base64'),
				userId: uId,
				appId: aId,
				created: Date.now()
			}).then((newToken) => {
				callback(null, newToken);
			});
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	return OAToken;
};
