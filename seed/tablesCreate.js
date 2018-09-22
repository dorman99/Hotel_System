var database = require('../providers/databaseProvider').connection;

var createUserTable = function() {
	let query = `CREATE TABLE Users (
			userId int NOT NULL AUTO_INCREMENT PRIMARY KEY,
			firstName varchar(30),
			lastName varchar(30),
			email varchar(20),
			password varchar(255),
			token varchar (255),
			userType ENUM('customer','admin','chef')
						)`
	database.query(query,function(err,result){
		if(err) {
			console.log(err)
		} else {
			console.log('Table Created')
			// console.log(result);
			// process.exit(1);
		}
	})
}

var createTableRooms = function() {
	let query = `CREATE TABLE Rooms (
				roomId int NOT NULL AUTO_INCREMENT PRIMARY KEY,
				name varchar(255),
				description text,
				image varchar(255),
				quantity int,
				price int
	)`
		database.query(query,function(err,result) {
			if(err) {
				console.log(err)
			} else {
				console.log('Table Rooms Created ')
			}
		})
}

var createTableProject = function() {
	let query = `CREATE TABLE userProjects (
			userId int NOT NULL,
			projectId int NOT NULL AUTO_INCREMENT PRIMARY KEY,
			checkIn DATE,
			createdDate DATE,
			modifiedDate DATE,
			project_status varchar(255),
			details varchar(255),
					FOREIGN KEY (userId)
					REFERENCES Users (userId)
					ON DELETE CASCADE
	)`
	database.query(query,function(err,result) {
		if(err) {
			console.log(err)
		} else {
			console.log('table userProjects has been created');
		}
	})
}

var createTableProjectDetail = function() {
	let query = `CREATE TABLE projectDetail (
		room_id int,
		project_id int
	)`
	database.query(query,function(err,result) {
		if(err) {
			console.log(err)
		} else {
			console.log('table project Detail has been created')
		}
	})
}

createUserTable(); //create table users
// createTableRooms();
createTableProject();
// createTableProjectDetail();