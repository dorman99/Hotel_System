
var errorHandle = function(req,res) {
	console.log(req.body, '  =====')
	res.status(req.body.error.statusCode).json({
		statusCode: req.body.error.statusCode,
		status: req.body.error.status,
		message: req.body.error.message
	})
}

module.exports = {
	errorHandle:errorHandle
}