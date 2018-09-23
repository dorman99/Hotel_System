var databaseProvider = require('../providers/databaseProvider')
var userProvider = require('../providers/userProvider')


var authUser = function(req,res,next) {
	databaseProvider.pool.getConnection('MASTER',function(err,connection) {
		if(err) {
			connection.release();
			res.send({
				message: err.message
			})
		} else {
			userProvider.authUser(connection,req.headers.token).then(resss=> {
				connection.release();
				req.body.user = resss
				return next()
			}).catch(err=> {
				connection.release();
				res.send({
					message:'auth failed'
				})
			})
		}
	})
}

var authAdmin = function(req,res,next) {
	let token = req.headers.token;
	databaseProvider.pool.getConnection('MASTER',function(err,connection) {
		let q = `select * from Users where token ='${token}'  AND userType = 'admin' `
			connection.query(q,function(err,rez) {
				connection.release();
				if(err) {
					res.send(err)
				} else if(rez.length <= 0) {
					res.send('you are not admin')
				} else {
					return next()
				}
			})
	})
}

module.exports = {
	authUser:authUser,
	authAdmin: authAdmin
}