function getId() {
  return Number(location.pathname.split("/").pop())
}
function getTags() {
  return nav.query.get("tags")
}

/*
window.addEventListener("load",function() {
  new xhr().on("success",function(res) {
    var index = res.index - res.lower;



    console.log(res.index , res.lower);
    console.log(res.images[index]);
    var f = res.images.splice(index, 1)[0];
    console.log(f);
    loadImages([f.id],function() {
      postInit()
      loadImages(res.images.map(i => i.id))
    });
  }).url("/image_data/" + document.location.pathname.split("/").reverse().find(function(a) {return a}) + (nav.query.get("tags") ? "?tags=" + nav.query.get("tags") : "")).go();
})*/



/// --- loader ---
window.addEventListener("load",function() {
  updateTree().then(function() {
    postInit()
  })
})

function updateTree() {
  return new Promise(function(resolve, reject) {
    new xhr().on("success",function(res) {
      index = res.index;
      images = new Array(res.total);
      Array.prototype.splice.apply(images,[res.lower,res.images.length].concat(res.images))

      Promise.all([loadImage(index - 1),loadImage(index),loadImage(index + 1)]).then(function() {
        preLoadImages();
        resolve()
      })

    }).url("/image_data/" + document.location.pathname.split("/").reverse().find(function(a) {return a}) + (nav.query.get("tags") ? "?tags=" + nav.query.get("tags") : "")).go();
  });
}

function loadImage(index) {
  return new Promise(function(resolve, reject) {
    if (!images[index]) return resolve()
    if (images[index].img) return resolve()
    var img = new Image();
    img.onload = function() {
      images[index].img = this;
      images[index].width = this.naturalWidth;
      images[index].height = this.naturalHeight;
      resolve()
    }
    img.onerror = function(e) {
      reject(e)
    }
    img.src = "/raw/" + images[index].id;
  });
}

function preLoadImages() {
  Promise.all(images.map(function(a,b) {return loadImage(b)})).then(function() {
    console.log("pre load done");
  })
}


/// ---  bare ---

window.images = []

window.addEventListener("load",function() {
  // loadImages(["img/6","img/7","img/8","img/9","img/10","img/11"],postInit);
})

function postInit() {
	console.log("postinit");
	document.addEventListener("keydown", function checkKey(e) {
		if (e.keyCode == '37') {
			next()
		} else if (e.keyCode == '39') {
			prev()
		};
	});
  var con = document.querySelector(".img");
  con.addEventListener("mousedown",mousedown);
  document.addEventListener("mouseup",mouseup);
  con.addEventListener("mousemove",mousemove);
  con.addEventListener('touchstart', mousedown, {passive: true})
  con.addEventListener('touchend', mouseup, {passive: true})
  con.addEventListener('touchmove', mousemove, {passive: true})
  window.addEventListener("resize",() => update(true), {passive: true})
  window.addEventListener("resize",() => console.log("res"), {passive: true})
  update()
}

function mousedown(e) {
  dragFrame("start",e)
}

function mouseup(e) {
  dragFrame("stop",e)
}

function mousemove(e) {
  dragFrame("move", e)
}

var down = false, startX;
function dragFrame(type,e) {
  e.preventDefault()
  var x = e.clientX;
  if (e.changedTouches) x = e.changedTouches[0].clientX;

  if (type == "start") {
    down = true;
    startX = x;
  }

  if (type == "stop") {
    down = false;
    if (x - startX < -window.innerWidth / 4.5) prev();
    if (x - startX > window.innerWidth / 4.5) next();
    update()
  }

  if (type == "move" && down) {
    noAni(document.querySelector(".img"),-(window.innerWidth * index) + x - startX  + "px");
  }
}

function prev() {
  if (index == images.length - 1) return;
  index++;
  updatePath();
  update();
}
function next() {
  if (index == 0) return;
  index--;
  updatePath()
  update();
}

function updatePath() {
  nav.changePath("/full/" + images[index].id + nav.query.serialize())
  updateTree()
}

window.index = 0;
function update(noAniamtion) {
  var con = document.querySelector(".img");
  var intrest = add(index);
  if (index - 1 > 0) add(index - 1);
  if (index < images.length - 1) add(index + 1);

  sortTree(".img")

   Array.prototype.slice.call(con.children).forEach(function (x) {
     if (x.clientWidth != window.innerWidth) x.style.width = window.innerWidth + "px";
     if (x.clientHeight != window.innerHeight) x.style.height = window.innerHeight + "px";
     if (x.clientLeft != parseInt(x.className.slice(4)) * window.innerWidth) x.style.left = parseInt(x.className.slice(4)) * window.innerWidth + "px";
     updateImage(x.querySelector("img"))
    })


  if (noAniamtion) {
    noAni(con,(con.getBoundingClientRect().left - intrest.getBoundingClientRect().left) + "px");
  } else {
    con.style.left = (con.getBoundingClientRect().left - intrest.getBoundingClientRect().left) + "px";
  }
  setTimeout(removeUnneeded,300)
}

function sortTree(id) {
  function getTree(_id) {
    return Array.prototype.slice.call(document.querySelector(_id).children)
  }

  tree = getTree(id)
  var goal = tree.map(a => a.className).sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
  })
  for (var i in tree) {
    if (tree[i].className != goal[i]) {
      var should = tree.find(a => a.className == goal[i]);
      if (tree[i].nextElementSibling) {
        tree[i].parentElement.insertBefore(should, tree[i].nextElementSibling);
      } else {
        tree[i].parentElement.appendChild(should)
      }
      tree = getTree(id)
    }
  }
}

function add(index) {
  var ell = document.querySelector(".img").querySelector(".img-" + index);

  if (!ell) {
    ell = document.createElement("div")
    ell.className = "img-" + index;
    ell.appendChild(images[index].img.cloneNode())
    document.querySelector(".img").appendChild(ell);
  }
  return ell;
}

function removeUnneeded() {
  var con = document.querySelector(".img");
  var imgs = Array.from(con.children);

  for (var i in imgs) {
    var offset = imgs[i].getBoundingClientRect();
    var id = parseInt(imgs[i].className.slice(4))
    if (offset.left + offset.width <= 0 || offset.left >= window.innerWidth) resetZoom(imgs[i].firstChild)
    if ((offset.left + offset.width > 0 && offset.left < window.innerWidth) || Math.abs(index - id) <= 1) continue;
    con.removeChild(imgs[i])
  }
}

function noAni(target,left) {
  target.classList.add('notransition'); // Disable transitions
  target.style.left = left;
  target.offsetHeight; // Trigger a reflow, flushing the CSS changes
  target.classList.remove('notransition'); // Re-enable transitions
}

function updateImage(img) {
  var con = img.parentElement;
  // con.setAttribute("y-offset",con.getAttribute("y-offset") || (window.innerHeight - img.naturalHeight) / 2);
  //
  // img.style.top = con.getAttribute("y-offset") + "px";

  resetZoom(img)
  if (!con.getAttribute("zoom-width")) {
  }
}

function resetZoom(img) {
  var con = img.parentElement;
  var s = maxSize(img.naturalWidth,img.naturalHeight,window.innerWidth,window.innerHeight)

  con.setAttribute("zoom-width",s.w);
  con.setAttribute("zoom-height",s.h);

  var p = positioner({x:0,y:0,w:s.w,h:s.h});
  con.setAttribute("zoom-x",Math.round(p.x));
  con.setAttribute("zoom-y",Math.round(p.y));

  img.style.left = p.x + "px";
  img.style.top = p.y + "px";
  img.style.width = s.w + "px";
  img.style.height = s.h + "px";
}

function maxSize(w,h,wMax,hMax) {
  var hRatio = wMax  / w;
  var vRatio =  hMax / h;
  var ratio  = Math.min ( hRatio, vRatio );

  return {w:Math.round(w * ratio),h:Math.round(h * ratio)}
}

function positioner(pos) {
	var cX = Math.max((window.innerWidth - pos.w)/2,0);
	var cY = Math.max((window.innerHeight - pos.h)/2,0);


	if (pos.x > cX) pos.x = cX;
	if (pos.y > cY) pos.y = cY;
	if (pos.x + pos.w < window.innerWidth) pos.x = window.innerWidth - pos.w - cX;
	if (pos.y + pos.h < window.innerHeight) pos.y = window.innerHeight - pos.h - cY;

	return pos;
}
