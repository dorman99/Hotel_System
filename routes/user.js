var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var errorHandle = require('../middlewares/errorHandle')
router.get('/mybookList/:userId',userController.getMyOrder,errorHandle.errorHandle)

module.exports = router