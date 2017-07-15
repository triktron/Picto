var express = require('express');

module.exports.preInit = function preInit(picto) {
	picto.extend("site", new site(picto));
}

function site(picto) {
	var self = this;
	this.picto = picto;

	this.nav = {
		top: [
			{path:"user",icon:"account_circle"},
			{path:"",icon:"insert_photo"},
			{path:"share",icon:"share"}
		],
		bottom: [
			{path:"settings",icon:"settings"}
		]
	}

	picto.on("init", function() {
		self.init()
	});
}

site.prototype.init = function init(_cb) {
	var self = this;
	this.picto.server.router.get("/", function(req, res, next) {
		var perPage = 72;
		var q = req.query.tags ? req.query.tags.split(",") : [];
		var page = parseInt(req.query.page) || 1;
		var offset = (page - 1) * perPage;

		self.picto.db.getAllImages(q).then(function(pics) {
			res.render(__dirname + "/static/index.njk", {navs:self.nav, images:pics.slice(offset,offset+perPage),page:page, tags:req.query.tags, pages: Math.ceil(pics.length / perPage)})
		}).catch(function(err) {
			res.status(500).send(err)
		})
	})

	///images/?limit=" + perPage + "&offset=" + (page - 1) * perPage + (nav.query.get("tags") ? "&tags=" + nav.query.get("tags") : ""

	this.picto.server.router.get("/raw/:id", function(req, res, next) {
		self.picto.db.getimage(req.params.id).then(function(img) {
			if (!img) return res.status(404).json({
				message: 'Photo not found'
			});

			res.sendFile(self.picto.dirname + "/" + (req.query.thumb == undefined ? img.src : img.thumb), null, function(err) {
				if (err) res.status(404).json({
					message: 'Photo not found',
					error: err
				});
			});
		}).catch(function(err) {
			console.log(err);
			res.status(500).send(err)
		})
	});


	this.picto.server.router.get('/full/:id', function(req, res, next) {
		res.render(__dirname + "/static/full.njk");
	})

	this.picto.server.router.use(express.static(__dirname + "/static",{extensions:"html", redirect: false}))
}
