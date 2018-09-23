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

			projectProvider.createOrder(connection,async,roomOrderArr,checkInTime,detail,userId,moment,night)
				.then(rezz => {
						connection.commit(function () {
							connection.release();
							res.status(200).json({
								message: 'Your Hotel Room has been Booked',
								status: 'Order Success'
							})
						})
				}).catch(err=> {
					// console.log(err, '-- ')
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

var cancelOrder = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			req.body.error = {
				status: 'Internal Server Error',
				status_code: 500,
				message: err.message
			}
			return next()
		} else {
			connection.beginTransaction(function() {
				let projectId = req.body.projectId;
				projectProvider.cancelBook(connection, projectId)
					.then(result => {
						projectProvider.updateAfterCancel(connection, projectId, async).then(result => {
							connection.commit(function() {
								connection.release();
								res.status(200).json({
									message: 'Update project has been canceled',
									status: 'Success'
								})
							})
						}).catch(err => {
							connection.rollback(function() {
								connection.release();
								req.body.error = {
									status: err.status,
									status_code: err.status_code,
									message: err.message
								}
								return next();
							})
						})
					}).catch(err => {
						console.log(err);
						connection.rollback(function () {
							connection.release();
							req.body.error = {
								status: err.status,
								status_code: err.status_code,
								message: err.message
							}
							return next();
						}) 
					})
			})
		}
	})
}

var editOrder = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			callback({
				status: 'Internal Server Error',
				status_code: 500,
				message: err.message
			})
		} else {
			
		}
	})
}

var allAvailableRoom = function(req,res,next) {
	database.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			req.body.error = {
				status: 'Internal Server Error',
				status_code: 500
			}
			return next()
		} else {
			// ini get dsari sini
			let dateInRequest = moment().format('YYYY-MM-DD');
			projectProvider.getAllRoomAvailable(connection,dateInRequest).then(ress=> {
				// connection.release(); 
				if(ress.code == 200) {
					// console.log('--',ress.dataRoom, ' -- 'data)
					ress = projectProvider.handleOtherAvailableRoom(ress.dataRoom,ress.dataCheckout)
					//  ress.data = ress.data.sort((a, b) => (a.roomId > b.roomId) ? 1 : ((b.roomId > a.roomId) ? -1 : 0))
					//  ress.data = projectProvider.handleAvailableRoomData(ress.data)
					 res.status(200).json({
						 message: 'Here Available Room For You',
						 rooms: ress,
						 status: 'success'
					 })
				 } else if(ress.code == 201) {
					res.status(200).json({
						message: 'Here Available Room For You',
						rooms: ress.data,
						status: 'success'
					})
				 }
			}).catch(err=> {
				connection.release()
				req.body.error = {
					status: err.status,
					status_code: err.status_code,
					message: err.message
				}
				return next()
			})
		}
	})
}

module.exports = {
	createOrder: createOrder,
	cancelOrder: cancelOrder,
	allAvailableRoom: allAvailableRoom
}