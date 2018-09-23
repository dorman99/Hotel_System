
var express = require('express');
var app     = express();
var bodyParser = require('body-parser');
var login = require('./routes/login');
var singup = require('./routes/signup')
var order = require('./routes/order')
var user = require('./routes/user')
var admin = require('./routes/adminRoutes')
app.set('port',4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/login', login)
app.use('/signup',singup)
app.use('/order',order)
app.use('/user',user)
app.use('/admin',admin)



app.use(function (req, res, next) {
	// console.log(req , '--- ')
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth-token");
	next();
});

app.listen(4000, function () {
	console.log("Node app is running at Port " + 4000);
});


module.exports = app;