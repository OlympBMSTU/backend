

const express = require('express');
const config = require('./config/config');
const db = require('./app/models');

const app = express();

app.use(function(req, res, next) {
  let allow = "http://80.87.193.245";
  if (req.get("Origin") == "http://127.0.0.1") {
    allow = "http://127.0.0.1";
  } else if (req.get("Origin") == "http://chs-polygon.website") {
    allow = "http://chs-polygon.website";
  }
  
	res.header("Access-Control-Allow-Origin", allow);
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
      });
    }
  }).catch((e) => {
    throw new Error(e);
  });

