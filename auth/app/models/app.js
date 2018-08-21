const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {

	const App = sequelize.define('App', {
		appId: DataTypes.STRING,
		appSecret: DataTypes.STRING
	});
	
	App.findApp = function (appId, callback) {
		this.findOne(
		{
			where: { appId: appId },
			rejectOnEmpty: true
		}
		).then((app) => {
			callback(null, app);
		}).catch(function (err) {
			callback(err, null);
		});
	}
	
	return App;
};

