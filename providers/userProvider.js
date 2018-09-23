var getMyProject = function(connection,userId) {
	return new Promise(function(resolve,reject) {
		let q = `select up.* from userProjects as up`
				q+= ` where up.userId = ${userId} AND project_status != 'canceled'`
				connection.query(q,function(err,result) {
					// console.log(err)
					if(err) {
						objErr =  {
							status: 'Internal Server Error',
							statusCode: 500,
							message: err.message
						}
						return reject(objErr)
					} else {
						return resolve(result)
					}
				})
	})
}

module.exports = {
	getMyProject: getMyProject
}