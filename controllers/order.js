var database = require('../providers/databaseProvider');
var async = require('async')
var projectProvider = require('../providers/projectProvider')
var moment = require('moment')

var createOrder = function(req,res,next) {
	console.log('ini masuk ke sini ')
	database.pool.getConnection('MASTER',function(err,connection) {
		connection.beginTransaction(function() {
			let roomOrderArr = req.body.roomOrdered;
			let userId = req.body.userId;
			let checkInTime = req.body.checkInTime;
			let night = req.body.night;
			let detail = req.body.detailOrder || '';
			// console.log(roomOrderArr)
			// console.log(req.body)
			// console.log(connection)
			projectProvider.createOrder(connection,async,roomOrderArr,checkInTime,detail,userId,moment,night)
				.then(rezz => {
					async.each(roomOrderArr,function(room,callback) {
						projectProvider.roomUpdate(connection,room.roomId,room.quantity).then(res=> {
							console.log(res)
							callback()
						}).catch(err=>{
							callback(err)
						})
					},function(err) {
						if(err) {
							connection.rollback(function() {
								connection.release();
								req.body.error = {
									status_code: err.status_code,
									status: err.status,
									message: err.message
								}
								return next();
							})
						} else {
							connection.commit(function() {
								connection.release();
								res.status(200).json({
									message: 'Your Hotel Room has been Booked',
									status: 'Order Success'
								})
							})
						}
					})
					// connection.release();
					// connection.query('UPDATE Rooms SET quantity = quantity+5 where roomId = 1',function(err,resul) {
					// 	connection.commit(function() {
					// 		connection.release();
					// 		console.log(resul)
							// res.status(200).json({
							// 	message: 'Your Hotel Room has been Booked',
							// 	status: 'Order Success'
							// })
					// 	})
					// })
				}).catch(err=> {
					req.body.error =  {
						status_code: err.status_code,
						status: err.status,
						message: err.message
					}
					return next();
				})
		})
	})
}

module.exports = {
	createOrder: createOrder
}