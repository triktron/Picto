var nunjucks = require('nunjucks');
var express = require('express');
const path = require('path');

var web = {}

web.init = function(picto) {
  web.picto = picto;

  web.app = express();
	nunjucks.configure({
		autoescape: true,
		express: web.app,
		noCache: true
	});

  web.app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		next();
	})

  web.images = require("./images")(web);
  web.tags = require("./tags")(web);
  web.nav = require("./nav")(web);

  web.app.get("/", function(req, res) {
    var query = req.query.q ? req.query.q.split(",") : [];
    var offset = Number(req.query.offset) || 0;
    var limit = Number(req.query.limit) || 72;

    web.picto.db.search(query, offset, limit, function(err, images, total) {
      if (err) return res.status(500).send('Internal Server Error');

      res.render(path.resolve("./lib/web/pages/index.html"),{
        query: query,
        offset: offset,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
        page: Math.floor(offset / limit) + 1,
        images: images.map(function(img) {
          return {
            id: img._id,
            hash: img.hash,
            tags: img.tags,
            info: img.info
          }
        }),
        navs: web.nav.list
      })
    })
	});

  web.app.use(express.static(path.resolve("./lib/web/static")))

  web.app.listen(picto.config.get("port") || 8080, function () {
    console.log('App listening on port 8080!')
  })

  return web;
}

module.exports = web.init;
