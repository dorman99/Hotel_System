var database = require('../providers/databaseProvider');

var CreateDatabase = function() {
	database.seedConnection.connect(function(err) {
		if(err) {
			console.log(err)
		} else {
			console.log('connected');
			database.seedConnection.query("CREATE DATABASE mydb",function(err,result) {
				if(err) {
					console.log(err)
				} else {
					console.log('database has been Created')
					process.exit(1)
				}
			})
		}
	})
}

// CreateDatabase(); creating DB