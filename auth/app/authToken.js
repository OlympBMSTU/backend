const crypto = require('crypto');

const tokenTimeToLive = 84600000;
const hashSecret = 'a1u7t5h6';
const iss = 'auth.olimp.bmstu.ru'
const sub = 'olimp.bmstu.ru'




module.exports = {
	formUnsigned : function (id, type, exp) {
		let header = { alg: 'HS256', typ: 'JWT'};
		header = JSON.stringify(header);

		let payload = { id: id, type: type, iss: iss, sub: sub, exp: exp };
		payload = JSON.stringify(payload);

		let unsignedToken = Buffer(header).toString('base64') + '.' + Buffer(payload).toString('base64');
		
		return unsignedToken;
	},

	encodeJWT : function (id, type) {
		let unsignedToken = this.formUnsigned(id, type, Date.now() + tokenTimeToLive);
		
		let signature = crypto.createHmac('sha256', hashSecret).update(unsignedToken).digest("hex");
		let jwt = unsignedToken + '.' + Buffer(signature).toString('base64');

		console.log(jwt);
		return jwt;
	},

	decodeJWT: function (jwt) {
		let sections = jwt.split('.');
		if (sections.length != 3) {
			return {res: "BAD_SECTIONS_FORMAT"}
		}

		let headerAndPayload = sections[0] + '.' + sections[1];

		let header = new Buffer(sections[0], 'base64').toString('utf8');
		try {
			header = JSON.parse(header);
		} catch (e) {
			return {res: "BAD_HEADER_FORMAT"}
		}
		console.log(header);

		let payload = new Buffer(sections[1], 'base64').toString('utf8');
		try {
			payload = JSON.parse(payload);
		} catch (e) {
			return {res: "BAD_PAYLOAD_FORMAT"}
		}
		console.log(payload);

		let signature = sections[2];

		let resJWT = {header: header, payload: payload, signature: signature};

		if (payload.exp < Date.now()) {
			console.log(payload.exp, Date.now())
			return {res: "TOKEN_TOO_OLD", jwt: resJWT};
		} 

		let testSignature = crypto.createHmac('sha256', hashSecret).update(headerAndPayload).digest("hex");

		if (testSignature != signature) {
			return {res: "INVALID_SIGNATURE", jwt: resJWT};
		}

		return {res: "OK", jwt: resJWT};
	}
}