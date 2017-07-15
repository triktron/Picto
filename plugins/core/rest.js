var express = require('express');

module.exports.preInit = function preInit(picto) {
	picto.extend("rest", new site(picto));
}

function site(picto) {
	var self = this;
	this.picto = picto;

	picto.on("init", function() {
		self.init()
	});
}

site.prototype.init = function init(_cb) {
	var self = this;

	this.picto.server.router.get("/tag/(:tag)?", function(req, res, next) {
		var q = req.params.tag ? req.params.tag : "";
		self.picto.db.getAllTags(q).then(function(tags) {
			res.json(tags);
		}).catch(function(err) {
			res.status(500).send(err)
		})
	});

	this.picto.server.router.get("/checkPort/:port", function(req, res, next) {
		var port = parseInt(req.params.port);
		if (isNaN(port)) next()
		self.picto.isPortTaken(port,function(is) {
			res.json(is)
		});
	});

	this.picto.server.router.get("/updateTags", function(req, res, next) {
		self.picto.db.updateTags().then(function() {
			res.end("Ok")
		}).catch(function(err) {
			res.status(500).send(err)
		})
	});

	this.picto.server.router.get('/images', function(req, res, next) {
		var q = req.query.tags ? req.query.tags.split(",") : [];
		var limit = parseInt(req.query.limit) || 20;
		var offset = parseInt(req.query.offset) || 0;

		self.picto.db.getAllImages(q).then(function(pics) {
			res.json({
				limit:limit,
				offset: offset,
				total:pics.length,
				images: pics.slice(offset,offset+limit)
			});
		}).catch(function(err) {
			res.status(500).send(err)
		})
	})

	this.picto.server.router.get('/image_data/:id', function(req, res, next) {
		var q = req.query.tags ? req.query.tags.split(",") : [];
		self.picto.db.getAllImages(q).then(function(pics) {
			var img = pics.find(function(a) {return a.id == Number(req.params.id)})
			if (!img) return res.status(404).json({
				message: 'Photo not found'
			});

			var limit = parseInt(req.query.limit) || 20;
			var index = pics.findIndex(function(a) {return a.id == img.id})
			var upper = Math.min(index + Math.ceil(limit/2),pics.length)
			var lower = Math.max(index - Math.floor(limit/2),0)

			res.json({
				limit:limit,
				upper: upper,
				lower: lower,
				index: index,
				total: pics.length,
				images: pics.slice(lower,upper)
			});
		}).catch(function(err) {
			res.status(500).send(err)
		})
	})
}
