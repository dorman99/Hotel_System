var express = require('express');
var router = express.Router();
var orderController = require('../controllers/order');
var errorHandle = require('../middlewares/errorHandle')

router.post('/createOrder',orderController.createOrder,errorHandle.errorHandle);
router.post('/cancelOrder',orderController.cancelOrder,errorHandle.errorHandle);
// router.put('/editmyorder/:projectId')
router.get('/availableRoom/:dateIn?',orderController.allAvailableRoom,errorHandle.errorHandle)
module.exports = router