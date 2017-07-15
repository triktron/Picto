var perPage = 72;
var page = 0;


window.addEventListener("load",init)
window.addEventListener("init",init)
if (document.readyState == 'complete') init();

window.addEventListener("resize",calculateTiles)

var isTicking = false, tileSize = 100, tilesPerRow = 1;
function calculateTiles() {
  if (!isTicking) {
    isTicking = true;
    return requestFrame(calculateTiles)
  }
  var lisInRow = Math.round((window.innerWidth - 64) / 198)
  var w = Math.floor((window.innerWidth - 64) / lisInRow - 48);

  var s = document.querySelector(".tileWidth");
  if (!s) {
    s = document.createElement("style");
    s.classList.add("tileWidth");
    document.head.appendChild(s);
  }
  s.innerHTML = ".thumbnail {width:"+w+"px;height:"+w+"px;}"
  tileSize = document.querySelector(".item").clientHeight;
  tilesPerRow = lisInRow;
  Ps.update(document.querySelector(".tiles"))

  isTicking = false;
}


/// new

var loadingNext = false;
function init() {

  if (typeof Awesomplete === 'undefined') {
    console.log("PerfectScroll not loaded yet, retrying in 50ms!");
    return setTimeout(function() {init()},50)
  }

  Ps.initialize(document.querySelector(".tiles"));

  /*
  document.querySelector(".tiles").addEventListener('ps-y-reach-end', function () {
    if (loadingNext) return;

    loadingNext = true;
    offset += perPage;
    get_images()
  })  */



  /*page = Number(nav.query.get("page")) || 1;*/
  /*
  document.querySelector(".tiles").addEventListener("wheel", function(e) {
    nav.query.set("offset",Math.floor(this.scrollTop / tileSize * tilesPerRow), true)
  })  */



  /*loadPage(page)*/
}

/*var xhrImages = new xhr().on("success",function(images) {
  var t = "";
  for (var i of images.images) t += "<div class=\"item\"><div class=\"thumbnail\"><a href=\"/full/" + i.id + (nav.query.get("tags") ? "?tags=" + nav.query.get("tags") : "") + "\"><img src=\"/raw/" + i.id + "?thumb\"></img></a></div></div>";

  var pages = Math.ceil(images.total / perPage)

  t += "<div class=\"paginator\">"
  if (page == 1) t += "<span>« Previous</span>"; else t += "<a onclick=\"loadPage(" + (page - 1) + ");return false;\">« Previous</a>"
  for (var i = 1;i < pages; i++) if (i == page) t+= "<span>" + page + "</span>"; else t+= "<a onclick=\"loadPage('" + i + "');return false;\">" + i + "</a>";
  console.log(page, pages);
  if (page == pages) t += "<span>Next »</span>"; else t += "<a onclick=\"loadPage(" + (page + 1) + ");return false;\">Next »</a>"
  console.log(Math.ceil(images.total / perPage));

  document.querySelector(".tiles").innerHTML = t;
  calculateTiles();
  loadingNext = false;
});*/

/*function loadPage(n) {
  if (location.pathname != "/") return;
  page = n;
  nav.query.set("page",n)
  xhrImages.abort().url("/images/?limit=" + perPage + "&offset=" + (page - 1) * perPage + (nav.query.get("tags") ? "&tags=" + nav.query.get("tags") : "")).go()
}*/
