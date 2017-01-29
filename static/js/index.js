var xhrImages = new xhr().on("success",function(images) {
  var t = "";
  for (var i of images.images) t += "<div class=\"item\"><div class=\"thumbnail\"><a href=\"/full/" + i.id + "\"><img src=\"/raw/" + i.id + "?thumb\"></img></a></div></div>";
  document.querySelector(".tiles").innerHTML = t;
});

function get_images() {
  if (location.pathname != "/") return;
  xhrImages.abort().url("http://localhost:3000/images/" + (nav.query.get("tags") ? "?tags=" + nav.query.get("tags") : "")).go()
}

window.addEventListener("load",get_images)
window.addEventListener("init",get_images)
if (document.readyState == 'complete') get_images();
