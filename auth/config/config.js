const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'auth-serv'
    },
    port: process.env.PORT || 3001,
    db: {
			username: "auth",
			password: "a1u7t5h6",
			database: "auth_db",
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
    port: process.env.PORT || 3001,
	db: {
		  username: "auth",
			password: "a1u7t5h6",
			database: "auth_db",
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
    port: process.env.PORT || 3001,
    db: {
			username: "auth",
			password: "a1u7t5h6",
			database: "auth_db",
			host: "127.0.0.1",
			port: "5432",
			dialect: "postgres"
	}
  }
};

module.exports = config[env];
