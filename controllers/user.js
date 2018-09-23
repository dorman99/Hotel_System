var database = require('../providers/databaseProvider');
var async = require('async')
var userProvider = require('../providers/userProvider')

var getMyOrder = function(req,res,next) {
	console.log('lol')
	database.pool.getConnection('MASTER',function(err,connection){
		let userId = req.params.userId;
		userProvider.getMyProject(connection,userId)
			.then(result=> {
				connection.release();
				res.status(200).json({
					status: 'Success',
					data: result
				})
			}).catch(err=> {
				console.log(err.statusCode)
				req.body.error = {
					message: err.message,
					status: err.status,
					statusCode: err.statusCode
				}
				console.log(' ---- ',req.body.err)
				return next()
			})
	})
}

module.exports = {
	getMyOrder: getMyOrder,
}