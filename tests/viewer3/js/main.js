window.images = []

function loadImages(raw,_cb) {
  var len = raw.length, done = 0;
  for (var i of raw) {
    var img = new Image();
    img.onload = function() {
      images.push({
        img:this,
        width:this.naturalWidth,
        height: this.naturalHeight
      })
      done++;
      if (len == done) _cb&&_cb()
    }
    img.src = i;
  }
}

window.addEventListener("load",function() {
  loadImages(["img/6","img/7","img/8","img/9","img/10","img/11"],postInit);
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
  con.addEventListener("mouseup",mouseup);
  con.addEventListener("mousemove",mousemove);
  con.addEventListener('touchstart', mousedown)
  con.addEventListener('touchend', mouseup)
  con.addEventListener('touchmove', mousemove)
  window.addEventListener("resize",() => update(true))
  update()
}

var down = false, startX;
function mousedown(e) {
  e.preventDefault()
  down = true;
  startX = e.clientX || e.changedTouches[0].clientX;
}

function mouseup(e) {
  down = false;
  var x = e.clientX || e.changedTouches[0].clientX;
  if (x - startX < 0) prev();
  if (x - startX > 0) next();
}

function mousemove(e) {
  if (!down) return;
  var x = e.clientX || e.changedTouches[0].clientX;
  noAni(document.querySelector(".img"),-(window.innerWidth * index) + x - startX + "px"); //(index == 0 ? 0 : -images[index].left) +
}

function prev() {
  if (index < images.length - 1) index++;
  update();
}
function next() {
  if (index > 0) index--;
  update();
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

  var hRatio = window.innerWidth  / img.naturalWidth    ;
  var vRatio =  window.innerHeight / img.naturalHeight  ;
  var ratio  = Math.min ( hRatio, vRatio );

  con.setAttribute("zoom-width",Math.round(img.naturalWidth * ratio));
  con.setAttribute("zoom-height",Math.round(img.naturalHeight * ratio));

  var p = positioner({x:0,y:0,w:con.getAttribute("zoom-width"),h:con.getAttribute("zoom-height")});
  con.setAttribute("zoom-x",Math.round(p.x));
  con.setAttribute("zoom-y",Math.round(p.y));


  img.style.left = p.x + "px";
  img.style.top = p.y + "px";
  img.style.width = con.getAttribute("zoom-width") + "px";
  img.style.height = con.getAttribute("zoom-height") + "px";
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
