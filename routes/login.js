var express = require('express')
var router = express.Router()
var loginController = require('../controllers/login')
var errorHandle = require('../middlewares/errorHandle')
router.post('/', loginController.login, errorHandle.errorHandle)

module.exports = router;