var express = require('express');

var app = express();

var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var nodemailer = require("nodemailer");
var nev = require('email-verification')(mongoose);

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "amrithdev98@gmail.com",
        pass: "developerworks"
    }
});
app.use(express.static('public'));
app.use(bodyparser.json());
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ccf');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to db');
});
var Schema = mongoose.Schema;
var Entryschema = new Schema({
    name: String,
    semester: String,
    branch: String,
    org: String,
    date: String,
    email: String,
    phone: String,
    desc: String
});
var Entry = mongoose.model('Entry', Entryschema);
module.exports = Entry;
app.get('/d', function(req, res, next) {
    Entry.find(function(err,data) {
        if (err) return console.error(err);
        console.log(data);
    });
    res.send();
    // dbase.collection('eventsdat', function(err, collection) {
    //     collection.find().toArray(function(err, data) {
    //         res.send(data);
    //     });
    // });
});
app.post('/submit', function(req, res, next) {
    var newentry = new Entry({
        name: req.body.name,
        semester: req.body.semester,
        branch: req.body.branch,
        org: req.body.org,
        date: req.body.date,
        email: req.body.email,
        phone: req.body.phone,
        desc: req.body.desc
    });
    console.log(newentry);
    Entry.count({ org: req.body.org, date: req.body.date }, function(err, entry) {
        console.log(entry);
        if (entry == 0) {
            newentry.save(function(err) {
                if (err) throw err;
                console.log('User saved successfully!');
            });
            res.send();
            var mailOptions = {
                from: 'amrithdev98@gmail.com', // sender address
                to: newentry.email, // list of receivers
                subject: 'Booking Confirmation', // Subject line
                text: newentry.name + ' has requested for blocking the ccf room for a ' + newentry.org + ' event on ' + newentry.date + '.' //, // plaintext body
                    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    console.log('Message sent: ' + info.response);
                    return;
                };
            });
        } else {
            console.log('Data Exists');
            res.send('fail');
        }
    });
});
app.listen(server_port, server_ip_address, function() {
    console.log('Server Up!');
});