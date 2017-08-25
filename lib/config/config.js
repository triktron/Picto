var fs = require("fs");
var config = {}

/**
 * a config module
 * @method config
 * @param  {string} path - path to the config files
 * @param  {bool} autoload -if the config files neets to be loaded on init
 */
config.init = function(path, autoload) {
	config.path = path;
	config.config = {};
  config.loaded = false;

	if (autoload) config.loadSync();

  return config;
}

/**
 * loads the config file
 * @method load
 * @param  {function} _cb - a function to call if it's done
 */
 config.load = function load(_cb) {
	_cb = _cb || function() {};
	fs.readFile(config.path, 'utf8', function(err, data) {
		if (err) {
			console.error("no config file found! creating it.");
			config.save();
			return _cb(false)
		};

		try {
			config.config = JSON.parse(data);
			 config.loaded = true;
			_cb(true)
		} catch (ex) {
			console.error("file is not a config file!", ex);
			process.exit();
		}
	});
}

/**
 * same as load but sync
 * @method loadSync
 */
config.loadSync = function loadSync() {
	config.loaded = true;
	if (!fs.existsSync(config.path)) return false;
	config.config = JSON.parse(fs.readFileSync(config.path, 'utf8'))
}

/**
 * saves the config to a file
 * @method save
 */
config.saveSync = function saveSync(_cb) {
	fs.writeFileSync(config.path, JSON.stringify(config.config), 'utf8');
}

/**
 * same as save but sync
 * @method save
 * @param  {function} _cb - a function to call if it's done
 */
config.save = function save(_cb) {
	fs.writeFile(config.path, JSON.stringify(config.config), 'utf8', _cb || function() {});
}

/**
 * gets a config value
 * @method get
 * @param  {string} key - the name of the value you want to get
 * @return {*}     		  - returns the value
 */
config.get = function get(key) {
	if (!config.loaded) return console.error("config file not loaded!");
	return config.config[key];
}

/**
 * sets a config value
 * @method set
 * @param  {string} key   - the name of the value
 * @param  {*}		  value - the value it that
 */
config.set = function set(key,value) {
	if (!config.loaded) return console.error("config file not loaded!");
	config.config[key] = value;
	config.saveSync()
}

module.exports = config.init;
