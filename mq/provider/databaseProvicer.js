var mysql = require('mysql');

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "sql1234",
	database: "mydb"
});

var seedConnection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'sql1234'
})

var masterConfig = {
	host: 'localhost',
	user: 'root',
	password: 'sql1234',
	database: 'mydb',
	connectionLimit: 10
}

var poolCluster = mysql.createPoolCluster();
poolCluster.add('MASTER', masterConfig)

// connection.connect(function(err) {
// 	if(err) {
// 		console.log(err);
// 	}
// 	console.log('Connected')
// })

module.exports = {
	connection: connection,
	seedConnection: seedConnection,
	pool: poolCluster
}