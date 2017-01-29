var nav = function nav(path) {
	this.path = location.pathname;

  var that = this;
  this.query = {
    query: {},
    get: function(key) {
      return this.query[key]
    },
    set: function(key, value) {
      this.query[key] = value;
      that.changePath(that.path + this.serialize(),true)
    },
    remove: function(key) {
      delete nav.query.query[key]
      that.changePath(that.path + this.serialize(),true)
    },
    serialize: function() {
      if (Object.keys(this.query).length == 0) return "";
      var that = this;
      return '?'+Object.keys(this.query).reduce(function(a,k){a.push(k+(that.query[k] == "" ? "" : '='+encodeURIComponent(that.query[k])));return a},[]).join('&')
    }
  }
  if (location.search != "") {
    var a = location.search.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
      var b = a[i].split('=');
      this.query.query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || null);
    }
  }

  this.req = new xhr().on("progress",function(p) {
    that.bar.style.width = (101 - that.bar.start) * p + that.bar.start + "%";
  }).on("success",function(el) {
    that.bar.style.width = "101%";
    that.bar.classList.add("waiting");
    a = Array.from(el.querySelectorAll("link[rel=stylesheet], script")).map(a => a.src || a.href);
    b = Array.from(document.querySelectorAll("link[rel=stylesheet], script")).map(a => a.src || a.href);
    var req = a.filter(function(i) {return b.indexOf(i) < 0;});
    for (var i of req) {
        var isCss = i.indexOf("css") >= 0;
        var n = document.createElement(isCss ? "link" : "script")
        if (isCss) n.rel = "stylesheet";
        n[isCss ? "href" : "src"] = i;
        document.head.appendChild(n);
        console.log("inported:",i);
    }
    document.querySelector(".content").innerHTML = el.querySelector(".content").innerHTML;
    window.dispatchEvent(new CustomEvent('init', {detail:that.path}));
  })
}

nav.prototype.changePath = function changePath(path, replace, loadPage) {
	if (replace) {
		window.history.replaceState(history.state, document.title, path);
	} else {
		window.history.pushState({prev: this.path}, document.title, path);
	}
	this.path = location.pathname;
  if (loadPage) {
    if (this.bar) this.bar.parentNode.removeChild(this.bar)
    this.bar = this.createLoadingBar();
    this.req.abort().url(this.path).go()
  }
}

nav.prototype.createLoadingBar = function () {
  var bar = document.createElement("div");
  bar.innerHTML = "<dt></dt><dd></dd>";
  document.body.appendChild(bar)
  bar.start = Math.round(Math.random() * 40) + 30;
  requestFrame(function(){if (bar.style.width != "101%") bar.style.width = bar.start + "%";})
  bar.id = "loadingbar"
  return bar;
};

window.onpopstate = function(e) {
	console.log(e);
	console.log(e.state, location.pathname);
};

var requestFrame = (function(){
  var raf = window.requestAnimationFrame ||
    function(fn){ return window.setTimeout(fn, 20); };
  return function(fn){
    return raf.call(window, fn);
  };
})();

window.nav = new nav()
