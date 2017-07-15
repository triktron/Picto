var nunjucks = require('nunjucks');
var express = require('express');
var httpolyglot = require('httpolyglot');
var fs = require('fs');

module.exports.preInit = function preInit(picto) {
	picto.extend("server", new server(picto));
}

function server(picto) {
	var self = this;
	this.picto = picto;
	this.port = 3000;

	this.app = express();
	nunjucks.configure({
		autoescape: true,
		express: this.app,
		noCache: true
	});

	this.router = express.Router()

	picto.on("init", function() {
		self.init()
	});
}

server.prototype.init = function init() {
	var self = this;
	this.app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		next();
	})
	this.app.use(/.{0,}\.njk$/, function(req, res, next) {
		res.status(404).send("Cannot " + req.method + " " + req.baseUrl);
	})
	this.app.use(this.router)

	httpolyglot.createServer({
		key: fs.readFileSync('server.key'),
		cert: fs.readFileSync('server.crt')
	}, this.app).listen(this.port, function() {
		console.log('server listening on port', self.port);
	});
}
