var moment = require('moment');
var getAllRoomAvailable = function(connection) {
	return new Promise(function(resolve,reject) {
		let q = `SELECT * FROM Rooms WHERE quantity > 0 `
		connection.query(q,function(err,results) {
			if(err) {
				let objError = {
					status_code: 500,
					status: 'Internal Server Error',
					message: err.message
				}
				return reject(objError)
			} else {
				return resolve(results)
			}
		})
	})
}

var createOrder = function(connection,async,roomOrderArr,checkIn,detail,userId,moment,night) {
	console.log('masuk ke create order')
	return new Promise(function(resolve,reject) {
		async.waterfall([
			function(callback) {
				let totalPrice = 0;
					for(let ii = 0; ii<roomOrderArr.length;ii++) {
						console.log('--- ',roomOrderArr[ii])
						totalPrice += roomOrderArr[ii].price;
					}
					// console.log(moment)
				let orderDetail = {}
						orderDetail.userId = userId;
						orderDetail.checkIn = moment().format(checkIn);
						orderDetail.createdDate = new Date()
						orderDetail.project_status = 'booked'
						orderDetail.paymentAmount = totalPrice;
				orderDetail.checkOut = moment(checkIn).add(night,'days').format('YYYY-MM-DD')
				connection.query(`INSERT INTO userProjects SET ?`,[orderDetail],function(err,rezz) {
							console.log(rezz)
							if(err) {
									callback({
										status: 'Internal Server Error',
										message: err.message,
										status_code: 500
									})						
							} else {
								callback(null,rezz.insertId)
							}
						})
			},function(orderId,callback) {
				console.log(orderId , ' ===== ')
				let values = [];
				for(let ii=0;ii<roomOrderArr.length;ii++) {
					values.push([orderId,roomOrderArr[ii].roomId,roomOrderArr[ii].quantity])
				}
				console.log(values)
				let q = `INSERT INTO projectDetail (project_id,room_id,quantity) VALUES ?`
				connection.query(q,[values],function(err,rez) {
					console.log(rez)
					if(err) {
						console.log(err)
						callback({
							status: 'Internal Server Error',
							status_code: 500,
							message: err.message
						})
					} else {
						callback(null,true)
					}
				})
			}
		],function(err,result){
			if(err) {
				console.log(err)
				return reject(err);
			} else {
				return resolve(true);
			}
		})
	})
}

var roomUpdate = function(connection,roomId,quantity) {
	return new Promise(function(resolve,reject) {
		// UPDATE Rooms SET quantity = quantity + 5 where roomId = 1
		connection.query(`UPDATE Rooms set quantity = quantity-${quantity} where roomId = ${roomId}`,function(err,result) {
			if(err) {
				return reject({
					status: 'Internal Server Error',
					status_code: 500,
					message: err.message
				})
			} else {
				connection.query(`select quantity from Rooms where roomId = ${roomId}`,function(err,ress) {
					// console.log('---<< ',result)
					if(err) {
						return reject({
							status: 'Internal Server error',
							status_code: 500,
							message: err.message
						})
					} else if (ress[0].quantity < 0) {
						return reject({
							status: 'Invalid Format',
							status_code: 403,
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

module.exports = {
	getAllRoomAvailable : getAllRoomAvailable,
	createOrder : createOrder,
	roomUpdate: roomUpdate
}