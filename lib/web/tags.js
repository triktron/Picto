var tags = {}

tags.init = function(web) {
  tags.web = web;

  web.app.get("/tag/(:tag)?" ,function(req, res) {
    var q = req.params.tag ? req.params.tag : "";

      tags.web.picto.db.db.findOne({_id: "tags"}, function(err, data) {
        if (err) return res.status(500).send(err);
        res.json((data.tags || []).filter(function(a) {
          return a.indexOf(q) == 0;
        }));
      })
  })

  return tags;
}

module.exports = tags.init;
