const fs = require('fs-extra');
const md5File = require('md5-file')
const Datastore = require('nedb');

var db = {}

db.init = function(picto) {
  db.picto = picto;
  db.path = picto.config.get("database") || "./databases/main/";
  db.db = new Datastore({filename: db.path + "db.nedb", autoload: true, corruptAlertThreshold: 1})

  return db;
}

db.add = function add(path,tags,info, _cb) {
  if (!fs.existsSync(path)) return _cb(false);

  var hash = md5File.sync(path);

  db.db.findOne({ hash: hash }, function (err, doc) {
    if (err || doc) return _cb(false);

    var id = db.picto.config.get("lastId") || 0;
    db.picto.config.set("lastId", id + 1);

    db.db.insert({
      _id: id,
      tags: tags || [],
      info: info || [],
      hash: hash
    }, function(err, doc) {
      if (err) return _cb(false);

      fs.ensureDir(db.path + "images")
      fs.copySync(path, db.path + "images/" + id);
      _cb(doc)
    })
  });
}

db.remove = function(id, _cb) {
  db.db.remove({ _id: id }, {}, function (err, numRemoved) {
    if (numRemoved > 0) {
      fs.unlink(db.path + "images/" + id, function(err) {
        if (err) _cb(false); else _cb(true);
      })
    } else _cb(false)
  });
}

db.get = function(id, _cb) {
  db.db.findOne({ _id: id}, function(err, img) {
    if (err) return _cb(false);

    _cb(img)
  })
}

db.search = function(q, offset, limit, _cb, noCount) {
  var f = {
    _id: {$ne: "tags"},
    $where: function() {
      var img = this;
      return q.every(function(tag) {return img.tags.indexOf(tag) >= 0;})
    }
  }

  db.db.find(f).skip(offset).limit(limit).exec(function(err, data) {
    if (err) return _cb(err);

    if (noCount) {
      _cb(null, data || [])
    } else {
      db.db.count(f,function(err, count) {
        if (err) return _cb(err);
        _cb(null, data || [], count)
      })
    }
  })
}

db.updateTags = function updateTags(_cb) {
  db.db.find({_id: {$ne: "tags"}}, function(err, i) {
    if (err) return _cb&&_cb(err);

    var tags = {};

    for (img of i) {
      for (tag of img.tags) {
        if (tags[tag]) tags[tag]++; else tags[tag] = 1;
      }
    }

    tags = Object.entries(tags).sort(function(a, b) {return b[1] - a[1];}).map(function(a) {return a[0];});
    db.db.update({_id: "tags"}, {_id:"tags", tags: tags}, {upsert:  true}, function(err) {
      if (err) return _cb&&_cb(err);
      _cb&&_cb(null);
    })

    // Promise.all(i.map(function(img) {
      // return new Promise(function(res, rej) {
        // db.db.update({id: "tags"}, { $addToSet: {"tags": {$each:img.tags}}}, {upsert:  true}, function(err) {
          // if (err) rej(err);
          // res();
        // })
    // :  });
    // })).then(function() {_cb&&_cb(null)}).catch(function(err) {_cb&&_cb(err)})
  })
}


module.exports = db.init;
