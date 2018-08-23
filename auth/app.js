

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

