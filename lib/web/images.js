const fs = require('fs');
const path = require('path');

var images = {}

images.init = function(web) {
  images.web = web;

  web.app.get("/image" ,function(req, res) {
    var query = req.query.q ? req.query.q.split(",") : [];
    var offset = Number(req.query.offset) || 0;
    var limit = Number(req.query.limit) || 72;

    web.picto.db.search(query, offset, limit, function(err, images, total) {
      if (err) return res.status(500).send('Internal Server Error');
      res.json({
        query: query,
        offset: offset,
        limit: limit,
        total: total,
        images: images.map(function(img) {
          return {
            id: img._id,
            hash: img.hash,
            tags: img.tags,
            info: img.info
          }
        })
      })
    })
  })

  web.app.get("/image/:id.json" ,function(req, res) {
    web.picto.db.get(Number(req.params.id), function(img) {
      if (!img) return res.status(404).send('Not Found');

      res.json({
        id: req.params.id,
        hash: img.hash,
        tags: img.tags,
        info: img.info
      });
    })
  })

  web.app.get("/image/:id/getSurrounding.json" ,function(req, res) {
    var query = req.query.q ? req.query.q.split(",") : [];
    var size = Number(req.query.size) || 5;

    web.picto.db.search(query, 0, Infinity, function(err, images) {
      if (err) return res.status(500).send('Internal Server Error');
      var index = images.findIndex(function(a) {return a._id == req.params.id});
      if (index == -1) return res.status(404).send('Not Found');

      var start = Math.max(0,index - size);
      res.json({
        query: query,
        total: images.length,
        images: images.slice(start, Math.min(images.length, index + size + 1)).map(function(img, i) {
          return {
            index: i + start,
            id: img._id,
            hash: img.hash,
            tags: img.tags,
            info: img.info
          }
        })
      })
    }, true)
  })

  web.app.get("/image/:id" ,function(req, res) {
    var filePath = path.resolve(web.picto.db.path + "images/" + req.params.id);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not Found')

    res.sendFile(filePath, {}, function(err) {
      if (err) res.status(500).send('Internal Server Error');
    })
  })

  return images;
}

module.exports = images.init;
