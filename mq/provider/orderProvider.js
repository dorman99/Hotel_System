const amqp = require('amqplib/callback_api')
var moment = require('moment');
var orderModel = require('../model/order')
var getAllRoomAvailable = function (connection, dateCheckInRequest) {
	return new Promise(function (resolve, reject) {
		let que = `SELECT * from userProjects where createdDate = '${dateCheckInRequest}'`
		connection.query(que, function (err, result) {
			console.log(result)
			if (err) {
				let objError = {
					statusCode: 500,
					status: 'Internal Server Error',
					message: err.message
				}
				return reject(objError)
			} else if (result.length <= 0) {
				let ques = `SELECT roomId,name,description,image,daily_quantity as roomAvailable,price FROM Rooms`
				connection.query(ques, function (err, rez) {
					if (err) {
						let objError = {
							statusCode: 500,
							status: 'Internal Server Error',
							message: err.message
						}
						return reject(objError)
					} else {
						return resolve({ data: rez, code: 201 })
					}
				})
			} else {
				dateCheckInRequest = moment(dateCheckInRequest).add(1, 'days').format('YYYY-MM-DD')
				let q = `SELECT rm.*,up.projectId from Rooms as rm`
				q += ` join projectDetail as pd ON rm.roomId = pd.room_id`
				q += ` join userProjects as up ON up.projectId = pd.project_id`
				q += ` where pd.checkOutDate = '${dateCheckInRequest}' `
				// q+= `GROUP BY `
				connection.query(q, function (err, results) {
					if (err) {
						let objError = {
							statusCode: 500,
							status: 'Internal Server Error',
							message: err.message
						}
						return reject(objError)
					} else {
						let getRom = `Select * from Rooms`;
						connection.query(getRom, function (err, resulth) {
							if (err) {
								let objError = {
									statusCode: 500,
									status: 'Internal Server Error',
									message: err.message
								}
								return reject(objError)
							} else {
								return resolve({ dataCheckout: results, dataRoom: resulth, code: 200 })
							}
						})
					}
				})
			}
		})
	})
}

var createOrder = function (connection, async, roomOrderArr, checkIn, detail, userId, moment, night) {
	console.log('masuk ke create order')
	return new Promise(function (resolve, reject) {
		async.waterfall([
			function (callback) {
				let totalPrice = 0;
				for (let ii = 0; ii < roomOrderArr.length; ii++) {
					console.log('--- ', roomOrderArr[ii])
					totalPrice += roomOrderArr[ii].price;
				}
				// console.log(moment)
				let orderDetail = {}
				orderDetail.userId = userId;
				orderDetail.checkIn = moment().format(checkIn);
				orderDetail.createdDate = new Date()
				orderDetail.project_status = 'booked'
				orderDetail.paymentAmount = totalPrice;
				orderDetail.checkOut = moment(checkIn).add(night, 'days').format('YYYY-MM-DD')
				connection.query(`INSERT INTO userProjects SET ?`, [orderDetail], function (err, rezz) {
					console.log(rezz)
					if (err) {
						callback({
							status: 'Internal Server Error',
							message: err.message,
							statusCode: 500
						})
					} else {
						callback(null, rezz.insertId, orderDetail.checkIn, orderDetail.checkOut)
					}
				})
			}, function (orderId, checkInDate, checkOutDate, callback) {
				console.log(orderId, ' ===== ')
				let values = [];
				for (let ii = 0; ii < roomOrderArr.length; ii++) {
					values.push([orderId, roomOrderArr[ii].roomId, roomOrderArr[ii].quantity, checkInDate, checkOutDate])
				}
				console.log(values)
				let q = `INSERT INTO projectDetail (project_id,room_id,quantity,checkInDate,checkOutDate) VALUES ?`
				connection.query(q, [values], function (err, rez) {
					console.log(rez)
					if (err) {
						console.log(err)
						callback({
							status: 'Internal Server Error',
							statusCode: 500,
							message: err.message
						})
					} else {
						callback(null, orderId)
					}
				})
			}
		], function (err, result) {
			if (err) {
				console.log(err)
				return reject(err);
			} else {
				return resolve(result);
			}
		})
	})
}

var roomUpdateBook = function (connection, roomId, quantity) {
	return new Promise(function (resolve, reject) {
		// UPDATE Rooms SET quantity = quantity + 5 where roomId = 1
		connection.query(`UPDATE Rooms set quantity = quantity-${quantity} where roomId = ${roomId}`, function (err, result) {
			if (err) {
				return reject({
					status: 'Internal Server Error',
					statusCode: 500,
					message: err.message
				})
			} else {
				connection.query(`select quantity from Rooms where roomId = ${roomId}`, function (err, ress) {
					// console.log('---<< ',result)
					if (err) {
						return reject({
							status: 'Internal Server error',
							statusCode: 500,
							message: err.message
						})
					} else if (ress[0].quantity < 0) {
						return reject({
							status: 'Invalid Format',
							statusCode: 403,
							message: `Not Enough Room(${roomId}) For Your Request`,
						})
					} else {
						return resolve(true)
					}
				})
			}
		})

	})
}

var cancelBook = function (connection, projectId) {
	return new Promise(function (resolve, reject) {
		let q = `select * from userProjects where project_status = 'canceled' AND projectId = ${projectId}`
		// console.log(q)
		connection.query(q, function (err, rezzz) {
			// console.log(rezzz)
			if (err) {
				return reject({
					status: 'Internal Server error',
					statusCode: 500,
					message: err.message
				})
			} else if (rezzz.length > 0) {
				return reject({
					status: 'Cannot project Update project',
					statusCode: 403,
					message: 'Project Has Been Updated before'
				})
			} else {
				let query = `UPDATE userProjects set project_status = 'canceled' where projectId = ${projectId}`
				console.log(query)
				connection.query(query, function (err, result) {
					if (err) {
						return reject({
							status: 'Internal Server Error',
							statusCode: 500,
							message: err.message
						})
					} else {
						return resolve(true)
					}
				})
			}
		})
	})
}

var updateAfterCancel = function (connection, projectId, async) {
	return new Promise(function (resolve, reject) {
		let q = `DELETE FROM projectDetail where project_id = ${projectId}`
		connection.query(q, function (err, result) {
			if (err) {
				return reject({
					status: 'Error',
					statusCode: 500,
					message: err.message
				})
			} else {
				return resolve(true)
			}
		})
	})
}

// var updateDetailProject = function(connection) {}
var handleAvailableRoomData = function (availablerooms) {
	let arrRooms = [];
	let count = 0;
	for (let x = 0; x < availablerooms.length; x++) {
		if (x == 0) {
			count++
			let objRoom = {
				roomId: availablerooms[x].roomId,
				name: availablerooms[x].name,
				description: availablerooms[x].description,
				image: availablerooms[x].image,
				price: availablerooms[x].price,
				RoomAmount: count
			}
			arrRooms.push(objRoom);
		} else if (availablerooms[x].roomId == availablerooms[x - 1].roomId) {
			arrRooms[arrRooms.length - 1].RoomAmount++
		} else {
			count = 1;
			let objRoom = {
				roomId: availablerooms[x].roomId,
				name: availablerooms[x].name,
				description: availablerooms[x].description,
				image: availablerooms[x].image,
				price: availablerooms[x].price,
				RoomAmount: count
			}
			arrRooms.push(objRoom);
		}
	}
	return arrRooms;
}

function compare(a, b) {
	if (a.roomId < b.roomId)
		return -1;
	if (a.roomId > b.roomId)
		return 1;
	return 0;
}


var handleOtherAvailableRoom = function (roomData, checkoutRooms) {
	let newRoomAvail = []
	for (let i = 0; i < roomData.length; i++) {
		let roomCheck = roomData[i];
		roomCheck.available = roomData[i].daily_quantity
		for (let j = 0; j < checkoutRooms.length; j++) {
			if (checkoutRooms[j].roomId == roomCheck.roomId) {
				roomCheck.available--
			}
		}

		if (roomCheck.available > 0) {
			newRoomAvail.push(roomCheck)
		}
	}
	return newRoomAvail
}

var mqHandleCreateOrder = function (orderData, moment) {
	let orderQueueData = {
		userId: orderData.userId,
		createdDate: moment()
	}
	return new Promise(function (resolve, reject) {
		orderModel.insertData(orderData, function (err, insertedData) {
			if (err) {
				return reject({
					statusCode: 500,
					status: 'mongo error',
					message: err.message
				})
			} else {
				amqp.connect('amqp://localhost', function (err, conn) {
					if (err) throw err
					conn.createChannel(function (err, ch) {
						if (err) throw err
						ch.assertQueue('orderHandle', { durable: true }, function reply(err, q) {
							ch.sendToQueue(q.queue, new Buffer(JSON.stringify(orderData)), { replyTo: q.queue, correlationId: orderData.userId.toString() })
								resolve(true)
						})
					})
				})
			}
		})
	})
}

module.exports = {
	getAllRoomAvailable: getAllRoomAvailable,
	createOrder: createOrder,
	roomUpdateBook: roomUpdateBook,
	cancelBook: cancelBook,
	updateAfterCancel: updateAfterCancel,
	handleAvailableRoomData: handleAvailableRoomData,
	handleOtherAvailableRoom: handleOtherAvailableRoom,
	mqHandleCreateOrder: mqHandleCreateOrder
}