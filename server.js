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
    name: { type: String, required: true },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    org: { type: String, required: true },
    date: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    desc: { type: String }
});
var TempDat = new Schema({
    name: { type: String, required: true },
    semester: { type: String, required: true },
    branch: { type: String, required: true },
    org: { type: String, required: true },
    date: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    desc: { type: String},
    GENERATED_VERIFYING_URL: String
});
var TempUser = mongoose.model('TempUser', TempDat);
var Entry = mongoose.model('Entry', Entryschema);
module.exports = Entry;
app.get('/d', function(req, res, next) {
    Entry.find(function(err, data) {
        if (err) return console.error(err);
        console.log('db ' + data);
        res.send(data);
    }).sort({ date: 1 });
});
app.get('/verify/:id', function(req, res, next) {
    nev.confirmTempUser(req.params.id, function(err, user) {
        console.log('user confirm mail' + user);
        console.log('url ' + req.params.id);
        if (err) console.log('confirm ' + err);
        if (user) {
            console.log('confirm mail' + user);
            // optional
            nev.sendConfirmationEmail(user.email, function(err, info) {
                console.log('confirmation info' + info);
                Entry.findOneAndUpdate({ email: user.email }, { email: '*' + user.email }, { new: true }, function(err, mailmodobj) {
                    console.log('mail mod ' + mailmodobj);
                });
                // redirect to their profile...
            });
        }
        // user's data probably expired...
        else console.log('else');
        // redirect to sign-up
    });
    res.send(req.params.id);
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
        console.log('entry ' + entry);
        if (entry == 0) {
            /*newentry.save(function(err) {
                if (err) throw err;
                console.log('User saved successfully!');
            });*/
            // Entry.findOne({email:newentry.email},function(err,obj){
            //     if(err) console.log('no existing use with same email id');
            //     else
            //     {
            //         Entry.update({email:obj.email},{email:obj.email+'*'});
            //     }
            // });
            // if(newentry.name==null || newentry.semester==null||newentry.branch==null||newentry.org==null|| newentry.date==null||newentry.email==null||newentry.phone==null)
            //         res.send('incomplete');
            // else
            //     res.send();
            nev.configure({
                verificationURL: 'http://localhost:3000/verify/${URL}',
                persistentUserModel: Entry,
                tempUserModel: TempUser,
                tempUserCollection: 'tempusers',
                transportOptions: {
                    service: 'Gmail',
                    auth: {
                        user: 'amrithdev98@gmail.com',
                        pass: 'developerworks'
                    }
                },
                verifyMailOptions: {
                    from: 'New Booking @ CCF <amrithdev98@gmail.com>',
                    subject: 'Please confirm the entry',
                    html: 'New Booking <br>' + 'Name: ' + newentry.name + '<br> Class: S' + newentry.semester + ' ' + newentry.branch + '<br> Organization: ' + newentry.org + '<br> date: ' + newentry.date + '<br> Phone Number: ' + newentry.phone + '<br>Click the following link to confirm event booking:</p><p>${URL}</p>',
                    text: 'Please confirm the entry by clicking the following url: ${URL}'
                },
                confirmMailOptions: {
                    from: 'CCF CET<amrithdev98@gmail.com>',
                    subject: 'Successfully verified!',
                    html: 'Your Booking for ccf on ' + newentry.date + ' has been approved for the ' + newentry.org + ' event',
                    text: 'Your Booking has been successfully verified.'
                },
            }, function(error, options) {
                if (err)
                    console.log('nev error ' + error);
            });
            nev.createTempUser(newentry, function(err, existingPersistentUser, newTempUser) {
                // some sort of error
                if (err) console.log(err);
                // user already exists in persistent collection...
                if (existingPersistentUser) {
                    console.log('existingPersistentUser ' + existingPersistentUser);
                }
                console.log('newTempUser ' + newTempUser);
                // handle user's existence... violently.
                // a new User
                //MULTIPLE USER PENDING ISSUE IS DUE TO EMAIL CONFLICT ... FINDING A PROPER FIX
                if (newTempUser) {
                    var URL = newTempUser[nev.options.URLFieldName];
                    nev.sendVerificationEmail('amrithdev98@gmail.com', URL, function(err, info) {
                        if (err) console.log(err);
                        else 
                        {
                            console.log('Ver info: ' + info);
                            res.send();
                        }
                        // handle error...
                        // flash message of successfully
                    });
                    // user already exists in temporary collection...
                } else {
                    console.log('new temp user failed');
                    res.send('incomplete');
                }
            });
         }else {
            console.log('Data Exists');
            res.send('fail');
        }
    });
});
app.post('/admin', function(req, res) {
    console.log(req.body);
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
    newentry.save(function(err) {
        if (err) throw err;
        console.log('User saved successfully!');
    });
    res.send();
});
app.delete('/admin/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
    Entry.find({ _id: id }).remove().exec();
    console.log('user removed');
});
app.get('/admin/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
    Entry.findById(id, function(err, myDocument) {
        console.log('mydoc' + myDocument);
        res.json(myDocument);
    });
});
app.put('/admin/:id', function(req, res) {
    var id = req.params.id;
    console.log(req.body.name);
    db.contactlist.findAndModify({
        query: { _id: mongojs.ObjectId(id) },
        update: { $set: { name: req.body.name, email: req.body.email, phone: req.body.phone } },
        new: true
    }, function(err, doc) {
        res.json(doc);
    });

});
app.listen(server_port, server_ip_address, function() {
    console.log('Server Up!');
});
