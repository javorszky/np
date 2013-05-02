var express = require('express'),
	app = express(),
	http = require('http'),
	path = require('path'),
	stylus = require('stylus'),
	nib = require('nib'),
	util = require('util'),
	uuid = require('node-uuid'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	config = require('./np-config.json');

mongoose.connect('localhost', 'nodepress');

app.locals = app.locals || {};
app.locals.npBase = 'http://localhost:3000/';
app.locals.npTitle = 'NodePress v0.0.1';
// console.log(app.locals);
// console.log(__dirname);

var entrySchema = mongoose.Schema({
	title: 'string',
	content: 'string'
});
var EntryObject = mongoose.model('Entry', entrySchema);


var compile = function(str, path) {
	return stylus(str).set('filename', path).set('compress', true).use(nib());
};

app.configure('development', function() {
	app.use(express.errorHandler());
});

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	// app.use(ndmw({
	// 	expiry: 604800000
	// }));
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.compress());
	app.use(app.router);
	app.use(stylus.middleware({
	    src: __dirname + '/public',
	    compile: compile
	}));
	app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/', function(req, res){
	var locals = {
		title: "The title"
	};
	res.render('index.jade', locals);
});

app.get('/admin', function(req, res){
	var locals = {
		title: "The title"
	};
	res.render('admin.jade', locals);
})

app.post('/rest', function(req, res){
	console.log(req.body);
	var newEntry = new EntryObject({
		title: req.body.title,
		content: req.body.content
	});
	newEntry.save();
	// console.log(req.body);
	var locals = {
		title: "awesome"
	};
	res.json({awesome:1})
	// res.render('index.jade', locals);
});

app.get('/rest', function(req, res){
	var things = [];
	EntryObject.find({}, function(err, entries){

		console.log(entries);
		res.json(entries);
	});
})
var server = app.listen(3000);


var herp = function(err, something) {
	console.log('herp', something);
};

console.log('Express server started on port %s', server.address().port);

