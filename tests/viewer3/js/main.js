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
  document.addEventListener("mouseup",mouseup);
  con.addEventListener("mousemove",mousemove);
  con.addEventListener('touchstart', mousedown)
  con.addEventListener('touchend', mouseup)
  con.addEventListener('touchmove', mousemove)
  con.addEventListener("wheel", zoom);
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

var start;
function dragFrameStart(e) {

}

var down = false, startX, startX2;
function dragFrame(type,e) {
  e.preventDefault()
  var x = e.pageX;
  if (e.changedTouches) x = e.changedTouches[0].clientX;

  // breakpoint;

  var br = document.querySelector(".img-" + index).getBoundingClientRect();
  var o = 0;
 if (br.left > 0) o = br.left;

  if (type == "start") {
    down = true;
    var b = e.srcElement.getBoundingClientRect();
    startX = x - b.left;
    var b = document.querySelector(".img").getBoundingClientRect();
    startX2 = x - b.left;
  }

  if (type == "stop") {
    down = false;
    // if (o && o < 0) prev();
    // if (o && o > 0) next();
    console.log("stop");
    // update()
  }

  if (type == "move" && down) {
    // console.log(-(window.innerWidth * index) + x - startX);

    // var s = maxSize(images[index].width,images[index].height,window.innerWidth,window.innerHeight);
    // console.log(e.srcElement.getBoundingClientRect().left - positioner({x:0,y:0,w:s.w,h:s.h}).x);

    // console.log(o, x , startX2 );

    noAni(document.querySelector(".img"),-(window.innerWidth * index) + x - startX2  + "px"); //(index == 0 ? 0 : -images[index].left) +
    // if (o) {
    // } else {
      // noAni(e.srcElement,(window.innerWidth * index) + x - startX + "px"); //(index == 0 ? 0 : -images[index].left) +
    // }
    // console.log(x , startX );
    // noAni(e.srcElement,-(window.innerWidth * index) + x - startX + "px"); //(index == 0 ? 0 : -images[index].left) +
  }
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

  if (!con.getAttribute("zoom-width")) {
    resetZoom(img)
  }
}

function resetZoom(img) {
  var con = img.parentElement;
  var s = maxSize(img.naturalWidth,img.naturalHeight,window.innerWidth,window.innerHeight)

  // con.setAttribute("zoom-width",s.w);
  // con.setAttribute("zoom-height",s.h);

  var p = positioner({x:0,y:0,w:s.w,h:s.h});
  // con.setAttribute("zoom-x",Math.round(p.x));
  // con.setAttribute("zoom-y",Math.round(p.y));

  // img.style.left = p.x + "px";
  // img.style.top = p.y + "px";
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

function zoom(e) {
  var img = e.target;
  var con = img.parentElement;
	var deltaY = 0;
  var bgPosX = parseInt(con.getAttribute("zoom-x"))
  var bgPosY = parseInt(con.getAttribute("zoom-y"))
  var bgWidth = parseInt(con.getAttribute("zoom-width"));
  var bgHeight = parseInt(con.getAttribute("zoom-height"));

	if (e.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
		deltaY = e.deltaY;
	} else if (e.wheelDelta) {
		deltaY = -e.wheelDelta;
	}

	var offsetX = e.pageX;
	var offsetY = e.pageY;

	// Record the offset between the bg edge and cursor:
	var bgCursorX = offsetX - bgPosX;
	var bgCursorY = offsetY - bgPosY;

	// Use the previous offset to get the percent offset between the bg edge and cursor:
	var bgRatioX = bgCursorX / bgWidth;
	var bgRatioY = bgCursorY / bgHeight;

	// Update the bg size:
	if (e.scale) {
		bgWidth = bgWidth * e.scale;
		bgHeight = bgHeight * e.scale;
	} else if (deltaY < 0) {
		bgWidth += bgWidth * .1//settings.zoom;
		bgHeight += bgHeight * .1//settings.zoom;
	} else {
		bgWidth -= bgWidth * .1//this.settings.zoom;
		bgHeight -= bgHeight * .1//this.settings.zoom;
	}

	// Take the percent offset and apply it to the new size:
	bgPosX = offsetX - (bgWidth * bgRatioX);
	bgPosY = offsetY - (bgHeight * bgRatioY);

	// Prevent zooming out beyond the starting size
	// if (bgWidth <= this.width || this.bgHeight <= this.height) {

    // con.setAttribute("zoom-width",bgWidth);
    // con.setAttribute("zoom-height",bgHeight);

    // con.setAttribute("zoom-x",bgPosX);
    // con.setAttribute("zoom-y",bgPosY);


    // img.style.left = bgPosX + "px";
    // img.style.top = bgPosY + "px";
    img.style.width = bgWidth + "px";
    img.style.height = bgHeight + "px";
	// }
}
