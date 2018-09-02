const request = require('request');

const url = 'https://www.google.com/recaptcha/api/siteverify';
const secret = '6LfhW20UAAAAAO3_sVQ1fIh2H9pcD4FhrrKKt9AB';


module.exports = {
	check : function (value, callback) {
		request.post({url: url, form: {secret: secret, response: value}}, 
		function(err,httpResponse,body) {
			 /* ... */ 
			 if(err) {
				console.log('error from request to reCaptcha: ' + err);
				callback(err, null);
			} else {
				console.log('response from reCaptcha: ' + body);
				let res = JSON.parse(body);
				callback(null, res);
			}
		});
	}
}