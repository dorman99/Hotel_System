
var crypto = require('crypto')
var login = function(connection,email,password) {
	// let email = req.body.email;
	// let password = req.body.password;
	return new Promise(function(resolve,reject) {
				if(isEmail(email)) {
					let q = `Select * from Users where email = '${email}' AND password ='${password}'`
					console.log(q)
					connection.query(q,function(err,rez) {
						console.log(rez)
						if(err) {
							return reject({
								statusCode: 500,
								status: 'Internal Server Error',
								message: err.message
							})
						} else if(rez.length > 0) {
							return resolve(rez[0].token)
						} else {
							return reject({
								statusCode: 403,
								status: 'Login Failed',
								message: 'Invalid Password'
							})
						}
					})
				} else {
					return reject({
						statusCode: 403,
						status: 'Login Failed',
						message: 'Invalid Email Format'
					})
				}
	})
}

var isEmail = function(email) {
	return true
}

var singUp = function(connection,userData,async) {
	return new Promise(function(resolve,reject) {
		if(isEmail(userData.email)) {
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
					userData.usertype = 'customer'
					userData.token = crypto.createHash('md5').update(userData.firstName + ' ' + userData.lastName, 'utf-8').digest('hex')
					connection.query(`INSERT INTO Users SET ?`, [userData], function (err, restult) {
						if (err) {
							console.log('aa ',err)
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
					console.log(err)
					let errorObj = {
						statusCode: err.statusCode,
						status: err.status,
						message: err.message
					}
					console.log(errorObj)
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

module.exports = {
	login:login,
	singUp: singUp
}