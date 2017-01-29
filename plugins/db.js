const fs = require('fs');
const sharp = require('sharp');

module.exports.preInit = function preInit(picto) {
	picto.extend("db", new db(picto));
}

function db(picto) {
	this.picto = picto;
	this.images = {img:[],tags:[]};
  this.loaded = false;
}

db.prototype.init = function init(_cb) {
	this.path = this.picto.config.get("database");

	this.load(_cb)
}

db.prototype.load = function load(_cb) {
  var self = this;
	_cb = _cb || function() {};
	fs.readFile(this.path + "db.json", 'utf8', function(err, data) {
		if (err) {
			console.error("no database file found! creating it.");
			self.save();
			return _cb(false)
		};

		try {
			self.images = JSON.parse(data);
			self.loaded = true;
			_cb(true)
		} catch (ex) {
			console.error("file is not a database file! creating it.", ex);
			self.save();
			_cb(false)
		}
	});
}

db.prototype.save = function save(_cb) {
  console.log(this.images);
	fs.writeFile(this.path + "db.json", JSON.stringify(this.images), 'utf8', _cb || function() {});
}

db.prototype.add = function add(image, remove, _cb) {
  var self = this;
  var newPath = this.path + "images/" + image.id;
	var thumb = this.path + "thumbs/" + image.id;
	var readStream = fs.createReadStream(image.src);
	var writeStream = fs.createWriteStream(newPath);

	readStream.on('error', function (err) {
	  console.error(err);
	});
	writeStream.on('error', function (err) {
	  console.error(err);
	});

	readStream.on('close', function() {
    function add() {
      image.src = newPath;

			sharp(newPath).resize(400, 400).toFile(thumb, function(err) {
					if (err) return console.log(err);
					image.thumb = thumb;
					self.images.img.push(image);
		      for (var i of image.tags) if (self.images.tags.indexOf(i) == -1) self.images.tags.push(i);
		      self.save(_cb);
				});
    }

		if (remove) fs.unlink(image.src, add); else add();
	});

	readStream.pipe(writeStream);
}

db.prototype.getimage = function (id) {
  return this.images.img.find(function (a) {
    return a.id == id;
  })
};

db.prototype.getAllTags = function getAllTAgs(q) {
  return this.images.tags.filter(function (a) {
    return a.indexOf(q) >= 0;
  })
}

db.prototype.getAllImages = function getAllImages(q) {
  return this.images.img.filter(function (a) {
    return q.every(function(tag) {
      return a.tags.indexOf(tag) >= 0;
    })
  })
}
