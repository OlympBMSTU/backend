const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'auth-serv'
    },
    port: process.env.PORT || 3004,
    db: {
			username: "postgres",
			password: "1",
			database: "auth-serv",
			host: "127.0.0.1",
			port: "5432",
			dialect: "postgres"
	}
  },

  test: {
    root: rootPath,
    app: {
      name: 'auth-serv'
    },
    port: process.env.PORT || 3004,
	db: {
			username: "postgres",
			password: "1",
			database: "auth-serv",
			host: "127.0.0.1",
			port: "5432",
			dialect: "postgres"
	}
  },

  production: {
    root: rootPath,
    app: {
      name: 'auth-serv'
    },
    port: process.env.PORT || 3004,
    db: {
			username: "postgres",
			password: "1",
			database: "auth-serv",
			host: "127.0.0.1",
			port: "5432",
			dialect: "postgres"
	}
  }
};

module.exports = config[env];
