
var errorHandle = function(req,res) {
	console.log(req.body)
	res.status(req.body.error.status_code).json({
		status_code: req.body.error.status_code,
		status: req.body.error.status,
		message: req.body.error.message
	})
}

module.exports = {
	errorHandle:errorHandle
}