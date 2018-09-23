var express = require('express');
var router	= express.Router();
var loginController = require('../controllers/login')
var errorHandle =  require('../middlewares/errorHandle')


// router.post('/',function(req,res,next) {
// 	res.send('ahay')
// })
router.post('/',loginController.singUp,errorHandle.errorHandle)


module.exports = router;