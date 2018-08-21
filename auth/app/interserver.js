const tokenTimeToLive = 360;
const request = require('request');

function authAppointmentServ (host, authInfo, callback) {
	const url = host+'/auth?appId='+authInfo.appId+'&appSecret='+authInfo.appSecret;
	
	console.log('Sending request to appointments serv: GET ' + url);
	
	request.get(url, {method: 'GET', uri: url}, function(errors, response, body){
		if(errors) {
			callback(false);
		} else {
			console.log('Auth response: ' + body);
			if (response.statusCode == 200) {
				authInfo.token = JSON.parse(body).token;
				console.log('Token now:'+authInfo.token+';');
				callback(true);
			}
			else 
				callback(false);
		}
	});
}

module.exports = {
	authCheck : function (authHeader, aggregationServAuth) {
		console.log('Auth header:' + authHeader + ';');
		if (typeof (authHeader) == 'undefined') return 'authHeader not specified';
		
		let authToken = authHeader.split(' ')[1];
		console.log('Auth token:' + authToken + ';');
		if ((Date.now() - aggregationServAuth.tokenDate)/1000 > tokenTimeToLive) {
			return "Token is too old";
		} else if (authToken === aggregationServAuth.token) {
			return null;
		} else {
			console.log("AuthFailed:\n"+authToken+"\n"+aggregationServAuth.token);
			return "Auth failed";
		}
	},
	
	reAuth : function (host, url, authInfo, reqFunc, failFunc) {
		// auth required branch
		authAppointmentServ (host, authInfo, function (reauthResult) {
			console.log('Reauth status: ' + reauthResult);
			if (reauthResult) {
				setTimeout(reqFunc,50);
			} else {
				// auth failed, so sending 500
				setTimeout(failFunc,50);
			}
		});
	}
}