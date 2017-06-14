var net = require('net')

module.exports.preInit = function preInit(picto) {
	picto.extend("isPortTaken", isPortTaken);
}

var isPortTaken = function(port, _cb) {
	var tester = net.createServer().once('error', function(err) {
		_cb(true)
	}).once('listening', function() {
		tester.once('close', function() {
			_cb(false)
		}).close()
	}).listen(port)
}
