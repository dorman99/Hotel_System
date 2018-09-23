const amqp = require('amqplib')
const moment = require('moment')
const orderModel = require('./model/order')
const orderProvide = require('./provider/orderProvider');
const databaseProvider = require('./provider/databaseProvicer')
const async = require('async')
amqp.connect('amqp://localhost').then(conn=> {
	conn.createChannel().then(ch=> {
		let orderHandle = ch.assertQueue('orderHandle',{durable:true});
			orderHandle.then((err,q)=> {
				console.log('halooo ini kita makan yaaaa ')
				return ch.consume('orderHandle',(msg) =>{
					console.log('order handle consume ')
					let orderData = JSON.parse(msg.content.toString());
						console.log(orderData,'----')
						// console.log()
						orderModel.findAll(orderData.projectId,(err,result)=>{
							console.log(result)
							if(result[0].userId == orderData.userId) {
								delete orderData._id
								console.log('masuk ke sini' ,orderData)
								databaseProvider.pool.getConnection('MASTER',function(err,connection){
									let roomOrder = orderData.roomOrdered;
									let checkIn = orderData.checkInTime;
									let night = orderData.night;
									let detail = orderData.detail
									let userId = orderData.userId
									orderProvide.createOrder(connection,async,roomOrder,checkIn,detail,userId,moment,night)
										.then(result=> {
											console.log(result)
											console.log('database updated')
										})
										.catch(err=> {
											if (err) throw err
										})
								})
							} else {
								console.log('You Lose Not Get Project')
								// let rejectOrder = ch.assertQueue('resultBidding',{durable:true});
								
							}
						})
				},{noAck:true})
			})
	})
})