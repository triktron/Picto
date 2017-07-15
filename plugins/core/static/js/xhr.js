function xhr() {
	this._url = null;
	this._method = "GET";
	this._headers = [];
  this.events = {};
}

xhr.prototype.url = function url(url) {
	this._url = url;
	return this;
};

xhr.prototype.method = function method(method) {
	this._method = method;
	return this;
};

xhr.prototype.on = function on(name, cb) {
	if (typeof cb === 'function') {
		this.events[name] = this.events[name] || [];
		this.events[name].push(cb);
	}
	return this;
}

xhr.prototype.trigger = function(name, data) {
	if (!this.events[name]) return this;

	for (var event of this.events[name]) event.call(this, data);;
	return this;
};

xhr.prototype.abort = function() {
	try {
		this.req.abort();
	} catch (e) {}
	return this;
};

xhr.prototype.go = function() {
	var that = this;
	this.req = new XMLHttpRequest();

	for (header in this._headers) {
		this.req.setRequestHeader(header, data.headers[header]);
	}

	this.req.onprogress = function onprogress(e) {
		if (e.lengthComputable) {
			that.trigger('progress', e.loaded / e.total);
		}
	};

	this.req.onload = function onRequestLoad() {
		var response = this.responseText;

		if (this.status >= 200 && this.status < 300) {
			if (typeof processRes === 'function') {
				response = processRes(response);
			}
      if (this.getResponseHeader('content-type').toLowerCase().startsWith("application/json")) {
        try {response = JSON.parse(response)} catch (e) {}
      }
      if (this.getResponseHeader('content-type').toLowerCase().startsWith("text/html")) {
        try {
          var html = document.createElement( 'html' );
          html.innerHTML = response;
          response = html;
      } catch (e) {}
      }
			that.trigger('success', response);
		}

		that.trigger(this.status, response);
		that.trigger('end', response);
	};


	this.req.onerror = function onRequestError(err) {
		that.trigger('error', err);
	};

	this.req.open(this._method, this._url);
  this.req.send();

	return this;
};
