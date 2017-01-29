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
	nunjucks.configure('static', {
		autoescape: true,
		express: this.app,
		noCache: true
	});
	this.app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		next();
	})

	picto.on("init", function() {
		self.init()
	});
}

server.prototype.init = function init() {
	var self = this;
	this.app.use(function(req,res,next) {
		if (req.originalUrl.endsWith(".tem")) res.sendStatus(404); else next();
	},express.static(this.picto.dirname + '/static',{extensions:"html"}));
	// this.app.get("/",function(req,res) {
	//   res.end((req.socket.encrypted ? 'HTTPS' : 'HTTP') + ' Connection!');
	// })

	httpolyglot.createServer({
		key: fs.readFileSync('server.key'),
		cert: fs.readFileSync('server.crt')
	}, this.app).listen(this.port, 'localhost', function() {
		console.log('server listening on port', self.port);
	});
}
