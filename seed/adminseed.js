var database = require('../providers/databaseProvider').connection;
var crypto = require('crypto')
var seedAdmin = function() {
	let password = crypto.createHash('md5').update('123456','utf-8').digest('hex');
	let token = crypto.createHash('md5').update('admin admin','utf-8').digest('hex')
	let query = `INSERT INTO Users (firstName,lastName,email,password,userType,token) 
								VALUES ('admin','admin','admin@admin.com','${password}','admin','${token}')`
		database.query(query,function(err,result) {
			if(err) {
				console.log(err)
			} else {
				console.log('admin seeded')
			}
		})
}

var seedHotel = function() {
	let query = `INSERT INTO Rooms (name,description,image,quantity,price) VALUES ?`
			values = [
				['Deluxe', 'Lorem ipsum.... dorem ipsamet.','https://www.google.co.id/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwiDtP7hnM7dAhWHPo8KHWmxAPEQjRx6BAgBEAU&url=https%3A%2F%2Fwww.hotelciputra.com%2Fen-gb%2Frooms%2Fdeluxe&psig=AOvVaw1zJzTMwmisf2YOWNjYq_FL&ust=1537692411732040',5,1000000],
				['Luxury', 'Lorem ipsum.... dorem ipsamet.', 'https://www.google.co.id/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwiDtP7hnM7dAhWHPo8KHWmxAPEQjRx6BAgBEAU&url=https%3A%2F%2Fwww.hotelciputra.com%2Fen-gb%2Frooms%2Fdeluxe&psig=AOvVaw1zJzTMwmisf2YOWNjYq_FL&ust=1537692411732040', 5, 500000]
			]
			database.query(query,[values],function(err,result) {
				if(err) {
					console.log(err)
				} else {
					console.log('Data has been stored')
				}
			})
}

seedAdmin();
// seedHotel();
