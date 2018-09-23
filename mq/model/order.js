const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

//database config
const dbName = '2359Hotel';

class Order {
	constructor() { }

	static insertData(projectObj, cb) {
		MongoClient.connect(url, { useNewUrlParser: true}, function (err, client) {
			console.log(err)
			const db = client.db(dbName);
			const project = db.collection('projectInsert');

			project.insert(projectObj, (err, inserted) => {
				if (err) throw err;
				cb(err, inserted)
			})

			client.close();
		})
	}

	static findAll(projectId, cb) {
		MongoClient.connect(url, {useNewUrlParser:true},function (err, client) {
			const db = client.db(dbName);
			const project = db.collection('projectInsert');
			console.log(projectId)
			project.find({ projectId: projectId }).toArray((err, result) => {
				if (err) throw err;
				cb(err, result)
			})
			client.close();
		})
	}
}

module.exports = Order
