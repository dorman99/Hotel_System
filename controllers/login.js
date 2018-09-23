var loginProvider = require('../providers/loginProvider');
var database = require('../providers/databaseProvider');
var crypto = require('crypto')
var errorHandle = require('../middlewares/errorHandle')
var async =  require('async')
var login = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		// console.log('==== ',req.body)
		if(err) {
			connection.release();
			return next(err)
		} else {
			let email = req.body.email;
			let password = crypto.createHash('md5').update(req.body.password,'utf-8').digest('hex');
			loginProvider.login(connection,email,password).then((rez) => {
				connection.release();
				res.status(200).json({
					message: 'Login Success',
					token: rez
				})
			}).catch(err=> {
				req.body.error = {
					statusCode: err.statusCode,
					status: err.status,
					message: err.message
				}
				return next()
			})
		}
	})
}

var singUp = function(req,res,next) {
	console.log('masuk ke sini')
	database.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			connection.release();
			req.body.error = {
				statusCode: 500,
				status: 'Internal Server Error',
				message: err.message
			}
			return next()
		} else {
			connection.beginTransaction(function() {
				let userData = req.body.userData;
				loginProvider.singUp(connection,userData,async).then(rez=> {
					connection.commit(function() {
						connection.release();
						res.status(200).json({
							statusCode: 200,
							status: 'Sign up Succes',
							token: rez
						})
					}) 
				}).catch(err=> {
					connection.rollback(function() {
						connection.release();
						// console.log(err)
						req.body.error = {
							statusCode: err.statusCode,
							status: err.status,
							message: err.message
						}
						// console.log(req.body)
						return next()
					})
				})
			})
		}
	})
}

module.exports = {
	login: login,
	singUp:singUp
}