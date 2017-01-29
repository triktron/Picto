module.exports.preInit = function preInit(picto) {
	picto.extend("site", new site(picto));
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
	this.picto.server.app.get("/raw/:id", function(req, res, next) {
		var img = self.picto.db.getimage(req.params.id);
		if (!img) return res.status(404).json({
			message: 'Photo not found'
		});
		res.sendFile(self.picto.dirname + "/" + (req.query.thumb == undefined ? img.src : img.thumb), null, function(err) {
			if (err) res.status(404).json({
				message: 'Photo not found',
				error: err
			});
		});
	});

	this.picto.server.app.get("/tag/(:tag)?", function(req, res, next) {
		var q = req.params.tag ? req.params.tag : "";
		var tags = self.picto.db.getAllTags(q)
		res.json(tags);
	});

	this.picto.server.app.get('/images', function(req, res, next) {
		var q = req.query.tags ? req.query.tags.split(",") : [];
		var limit = parseInt(req.query.limit) || 20;
		var offset = parseInt(req.query.offset) || 0;

		var pics = self.picto.db.getAllImages(q)
		res.json({
			limit:limit,
			offset: offset,
			total:pics.length,
			images: pics.slice(offset,offset+limit)
		});
	})
}
