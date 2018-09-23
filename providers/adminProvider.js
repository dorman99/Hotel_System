var crypto = require('crypto')
var createUser = function (connection, userData, async) {
	return new Promise(function (resolve, reject) {
		if (isEmail(userData.email)) {
			async.series([
				function (callback) {
					let query = `select * from Users where email = '${userData.email}'`
					connection.query(query, function (err, rezz) {
						console.log(rezz)
						if (err) {
							console.log('lol')
							callback({
								statusCode: 500,
								status: 'Internal Server Error',
								message: err.message
							})
						} else {
							if (rezz.length > 0) {
								console.log('asaa')
								callback({
									statusCode: 404,
									status: 'Registration Failed',
									message: 'Email Has been Used'
								})
							} else {
								callback(null, true)
							}
						}
					})
				}, function (callback) {
					userData.password = crypto.createHash('md5').update(userData.password, 'utf-8').digest('hex');
					// userData.usertype = 'customer'
					userData.token = crypto.createHash('md5').update(userData.firstName + ' ' + userData.lastName, 'utf-8').digest('hex')
					connection.query(`INSERT INTO Users SET ?`, [userData], function (err, restult) {
						if (err) {
							console.log('aa ', err)
							callback({
								statusCode: 500,
								status: 'Internal Server Error',
								message: err.message
							})
						} else {
							callback(null, userData.token)
						}
					})
				}
			], function (err, results) {
				if (err) {
					// console.log(err)
					let errorObj = {
						statusCode: err.statusCode,
						status: err.status,
						message: err.message
					}
					// console.log(errorObj)
					return reject(errorObj)
				} else {
					// console.log('--->> ',results)
					return resolve(results[1])
				}
			})
		} else {
			return reject({
				status: 'Email Format Invalid ',
				statusCode: 404,
				message: 'Please Checkout Your Email format'
			}) // sampe disini
		}
	})
}

var isEmail = function (email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

var deleteUser = function(connection,userId) {
	return new Promise(function(resolve,reject) {
		let q = `DELETE from Users where userId = ${userId}`
			connection.query(q,function(err,ress) {
				if(err) {
					throw err
				} else {
					return resolve(true)
				}
			})
	})
}

module.exports = {
	createUser: createUser,
	deleteUser: deleteUser
}