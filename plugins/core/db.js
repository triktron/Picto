const fs = require('fs-extra');
var fileType = require('file-type');
var Datastore = require('nedb');

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
  this.loaded = false;
}

db.prototype.init = function init(_cb) {
  this.path = this.picto.config.get("database");
  this.db = new Datastore({filename: this.picto.config.get("database") + "db.db", autoload: true, corruptAlertThreshold: 1})
}

db.prototype.add = function add(image, remove, save = true) {
  var img = this.path + "images/" + image.id;
  var thumb = lwipInstalled ? this.path + "thumbs/" + image.id : img;
  if (remove) fs.moveSync(image.src, img); else fs.copySync(image.src, img);

  return this.setimage({
    "tags": image.tags,
    "info": image.info,
    "description": image.description,
    "id": image.id,
    "src": img,
    "thumb": thumb
  }).then(new Promise(function(res, rej) {
    if (!lwipInstalled) return res();

    var buff = fs.readFileSync(img)
    lwip.open(buff, fileType(buff).ext, function(err, i) {
      if (err) return rej()

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
        if (err) rej()
        res()
      });
    });
  }))
}

db.prototype.updateTags = function() {
  var that = this;

  return new Promise(function(resolve, reject) {
    that.db.find({id: {$ne: "tags"}}, function(err, i) {
      if (err) return reject(err);

      Promise.all(i.map(function(img) {
        return new Promise(function(res, rej) {
          that.db.update({id: "tags"}, { $addToSet: {"tags": {$each:img.tags}}}, {upsert:  true}, function(err) {
            if (err) rej(err);
            res();
          })
        });
      })).then(resolve).catch(reject)
    })
  });
}

db.prototype.getimage = function(id) {
  var that = this;

  return new Promise(function(resolve, reject) {
    that.db.findOne({id: Number(id)}, function(err, data) {
      if (err || !data) reject(err);
      resolve(data)
    })
  });
};

db.prototype.setimage = function(img) {
  var that = this;

  return new Promise(function(resolve, reject) {
  Promise.all([new Promise(function(res, rej) {
    that.db.update({id: Number(img.id)}, img, {upsert:  true}, function(err) {
      if (err) rej(err);
      res();
    })
  }),that.updateTags()]).then(resolve).catch(reject)
  });
};

db.prototype.getAllTags = function getAllTags(q) {
  var that = this;

  return new Promise(function(resolve, reject) {

    that.db.findOne({id: "tags"}, function(err, data) {
      if (err) reject(err);
      resolve((data.tags || []).filter(function(a) {
        return a.indexOf(q) == 0;
      }));
    })
  });
}

db.prototype.getAllImages = function getAllImages(q) {
  var that = this;

  return new Promise(function(resolve, reject) {
    that.db.find({id: {$ne: "tags"}, $where: function() {
      var img = this;
      return q.every(function(a) {return img.tags.indexOf(a) >= 0;})}
    }, function(err, data) { //
      if (err) reject(err);
      resolve(data||[])
    })
  });
}
