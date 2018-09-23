var adminController = require('../controllers/admin')
var authAdmin = require('../middlewares/auth')
var express = require('express');
var router = express.Router();

router.post('/createNewUser',authAdmin.authAdmin,adminController.createNewUser)
			.delete('/deleteUser',adminController.deleteUser)

module.exports = router;