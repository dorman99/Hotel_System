var express = require('express');
var router = express.Router();
var orderController = require('../controllers/order');
var errorHandle = require('../middlewares/errorHandle')

router.post('/createOrder',orderController.createOrder,errorHandle.errorHandle)


module.exports = router