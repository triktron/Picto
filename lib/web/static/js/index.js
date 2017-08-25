function openImage(id) {
  if (images && !images.includes(undefined)) return;

  var id = typeof id == "number" ? id : Number(this.querySelector("img").src.split("/").pop());
  var tags = inp.input.value.split(", ").filter(a => a != "").join(",")

  new xhr().on("success",function(data) {
    if (!images) images = Array(data.total);

    for (img of data.images) {
      if (!images[img.index]) images[img.index] = {
        src: "/image/" + img.id,
        id: img.id,
        w: img.info.find(function(a) {return a.key == "width"}).value,
        h: img.info.find(function(a) {return a.key == "height"}).value
      }
    }

      var options = {
          index: images.findIndex(function(a) {return a && a.id == id}),
          history: false
      };

      if (!gallery) {
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, images, options);
        gallery.init();
        gallery.listen('close', function() {
          pswpElement.classList.remove("pswp--open");
          gallery = null;
        });
        gallery.listen('afterChange', function() {
          openImage(images[gallery.getCurrentIndex()].id)
        });
      }
  }).url("/image/" + id + "/getSurrounding.json" + (tags ? "?q=" + tags : "")).go()
}

var images = null;
var pswpElement, gallery;
function init() {
  var thumbnails = document.querySelectorAll('.thumbnail');

  for (var thumbnail of thumbnails) {
    thumbnail.addEventListener("click", openImage)
  }

  pswpElement = document.querySelectorAll('.pswp')[0];
}

window.addEventListener("load",init)
window.addEventListener("init",init)
