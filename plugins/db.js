const fs = require('fs-extra');
var fileType = require('file-type');

var lwipInstalled = true,
  lwip;
try {
  require.resolve("pajk-lwip");
  lwip = require('pajk-lwip')
} catch (e) {
  console.error("lwip not found!");
  lwipInstalled = false;
}

module.exports.preInit = function preInit(picto) {
  picto.extend("db", new db(picto));
}

function db(picto) {
  this.picto = picto;
  this.images = {
    img: [],
    tags: []
  };
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
  console.log("saving");
  fs.writeFile(this.path + "db.json", JSON.stringify(this.images), 'utf8', _cb || function() {});
}

db.prototype.add = function add(image, remove, save = true) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var thumb = self.path + "thumbs/" + image.id;
    var img = self.path + "images/" + image.id;
    if (remove) fs.moveSync(image.src, img)
    if (!remove) fs.copySync(image.src, img)


    var done = new Promise(function(resolve, reject) {
      self.images.img.push({
        "tags": image.tags,
        "info": image.info,
        "description": image.description,
        "id": image.id,
        "src": img,
        "thumb": thumb
      });
      for (var i of image.tags)
        if (self.images.tags.indexOf(i) == -1) self.images.tags.push(i);
      if (save) return self.save(function() {
        resolve()
      });
      resolve()
    });


    if (lwipInstalled) {
      var buff = fs.readFileSync(img)
      lwip.open(buff, fileType(buff).ext, function(err, i) {
        if (err) {
          thumb = img;
          return done.then(resolve)
        }

        var origWidth = i.width(),
          origHeight = i.height(),
          origRatio = (origHeight !== 0 ? (origWidth / origHeight) : 1),
          cropWidth = origWidth,
          cropHeight = origHeight

        if (1 > origRatio) {
          cropHeight = origWidth;
        } else if (1 < origRatio) {
          cropWidth = origHeight;
        }

        i.batch().crop(cropWidth, cropHeight).resize(400, 400, 'lanczos').writeFile(thumb, "jpeg", function(err) {
          if (err) {
            thumb = img;
          }
          done.then(resolve)
        });
      });
    } else {
      thumb = img;
      done.then(resolve)
    }
  });
}

db.prototype.getimage = function(id) {
  return this.images.img.find(function(a) {
    return a.id == id;
  })
};

db.prototype.getAllTags = function getAllTAgs(q) {
  return this.images.tags.filter(function(a) {
    return a.indexOf(q) >= 0;
  })
}

db.prototype.getAllImages = function getAllImages(q) {
  return this.images.img.filter(function(a) {
    return q.every(function(tag) {
      return a.tags.indexOf(tag) >= 0;
    })
  })
}
