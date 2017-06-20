var fs = require("fs");

module.exports = function(path, _cb) {
	var self = this;
	this.path = __dirname + "/" + path;
	this.config = {
    port: 3000,
		lastId: 0,
		database: "./databases/main/"
  };
  this.loaded = false;

	this.load = function load(_cb) {
		_cb = _cb || function() {};
		fs.readFile(this.path, 'utf8', function(err, data) {
			if (err) {
				console.error("no config file found! creating it.");
				self.save();
				return _cb(false)
			};

			try {
				self.config = JSON.parse(data);
        self.loaded = true;
				_cb(true)
			} catch (ex) {
				console.error("file is not a config file! creating it.",ex);
				self.save();
				_cb(false)
			}
		});
	}

	this.save = function save(_cb) {
    fs.writeFile(this.path, JSON.stringify(this.config), 'utf8', _cb || function() {});
	}

  this.get = function get(key) {
    if (!this.loaded) return console.error("config file not loaded!");
    return this.config[key];
  }

  this.set = function set(key,value,_cb) {
    if (!this.loaded) return console.error("config file not loaded!");
    this.config[key] = value;
    this.save(_cb || function() {})
  }

	this.load(_cb);
}
