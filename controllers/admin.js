var adminProvider = require('../providers/adminProvider')
var database = require('../providers/databaseProvider');
var crypto = require('crypto')
// var errorHandle = require('../middlewares/errorHandle')
var async = require('async')

var createNewUser = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		connection.beginTransaction(function() {
			if (err) {
				connection.rollback(function() {
					connection.release();
					throw err
				})
			} else {
				let userData = req.body.userData;
				adminProvider.createUser(connection, userData, async).then(resz => {
					connection.commit(function() {
						connection.release();
						res.status(200).json({
							message: 'user has been created ',
							status: 'succes'
						})
					})
				}).catch(err => {
					connection.rollback(function() {
						connection.release();
						return next(err.message)
					})
				})
			}
		})
	})
}
var deleteUser = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			connection.release();
		} else {
			let userId = req.body.userId;
			adminProvider.deleteUser(connection,userId).then(rez=> {
				connection.commit(function() {
					connection.release();
					res.send({
						status: 'succes deleting user'
					})
				})
			}).catch(err=> {
				connection.rollback(function() {
					connection.release();
					return next(err.message)
				})
			})
		}
	})
}
module.exports = {
	createNewUser: createNewUser,
	deleteUser: deleteUser
}