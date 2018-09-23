var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var errorHandle = require('../middlewares/errorHandle')
var authUser = require('../middlewares/auth')

router.get('/mybookList/:userId',authUser.authUser,userController.getMyOrder,errorHandle.errorHandle)

module.exports = router