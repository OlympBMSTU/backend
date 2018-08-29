

const express = require('express');
const config = require('./config/config');
const db = require('./app/models');

const winston = require('winston');

winston.configure({
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

const app = express();
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://80.87.193.245");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH")
	next();
});


module.exports = require('./config/express')(app, config);

db.sequelize
  .sync()
  .then(() => {
    if (!module.parent) {
      app.listen(config.port, () => {
        console.log('Express server listening on port ' + config.port);
        winston.log('info', 'Express server listening on port ' + config.port, {
          timestamp: new Date().toDateString()
        })
      });
    }
  }).catch((e) => {
    throw new Error(e);
  });

