var express=require('express');

var app=express();

var bodyparser=require('body-parser');

var mongodb=require('mongodb');

var MongoClient=mongodb.MongoClient;



var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
app.use(express.static('public'));

app.use(bodyparser.json());
var dbase;
mongodb_connection_string = 'mongodb://localhost:27017/' + 'ccfdata';
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + 'ccfdata';
}
MongoClient.connect(mongodb_connection_string,function(err,db) {
	if(!err)
	{
		dbase=db;
		console.log("connected");
		}
});
app.get('/d',function(req,res,next){

		dbase.collection('eventsdat',function(err,collection){
			collection.find().toArray(function(err,data){
					res.send(data);
			});
	});	
});
app.post('/submit',function(req,res,next){
        var evnt={
        name:req.body.name,
		semester:req.body.semester,
		branch:req.body.branch,
		org:req.body.org,
		date:req.body.date,
		email:req.body.email,
		phone:req.body.phone,
		desc:req.body.desc

	};
	console.log(evnt);
		dbase.collection('eventsdat',function(err,collection){
			collection.insert(evnt,{w:1},function(err,data){
					res.send();
			});
	});	
});
app.listen(server_port, server_ip_address,function() {
	console.log('Server Up!');
});