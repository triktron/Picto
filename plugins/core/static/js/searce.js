var xhrTags = new xhr().on("success",function(list) {
  inp.list = list
  inp.evaluate();
});

function initTags() {
  if (location.pathname != "/") return;

  if (typeof Awesomplete === 'undefined') {
    console.log("Awesomplete not loaded yet, retrying in 50ms!");
    return setTimeout(function() {initTags()},50)
  }

  window.inp = new Awesomplete('input[data-multiple]', {
    filter: function(text, input) {
      return Awesomplete.FILTER_CONTAINS;
    },

    replace: function(text) {
      var parts = this.input.value.split(", ")
      var curr = this.input.value.substring(0,this.input.selectionStart).split(", ").length - 1;
      console.log(parts,curr);
      parts[curr] = text;
      this.input.value = parts.join(", ");
      var p = parts.splice(0,curr).join(", ").length + text.length + 2;
      this.input.setSelectionRange(p,p)
    },

    item: function(item) {
      var ell = document.createElement("li");
      ell.innerText = item;
      return ell;
    },
    minChars:0,
    maxItems:30
  });


  document.querySelector("input[data-multiple]").onkeyup = function(evt) {
    if (evt.keyCode == 13) {
      // history.replaceState(history.state, document.title, location.pathname + "?tags=" + this.value.split(", ").filter(a => a != "").join(",") + (getParameterByName("page") != null ? ("&page=" + getParameterByName("page")) : ""));
      // history.replaceState(history.state, document.title, location.pathname + (this.value == "" ? "" : serialize({tags:this.value.split(", ").filter(a => a != "").join(",")})));
      // if (this.value == "") nav.query.remove("tags"); else nav.query.set("tags",this.value.split(", ").filter(a => a != "").join(","))

      // offset = 0;
      // document.querySelector(".tiles").innerHTML = "";
      // document.querySelector('input[data-multiple]').blur()
      var tags = this.value.split(", ").filter(a => a != "").join(",")
      return nav.changePath('/' + (tags ? "?tags=" + tags : ""),false,true)
    }
    if (evt.keyCode == 38 || evt.keyCode == 40) return;
    var parts = this.value.split(", ")
    var curr = this.value.substring(0,this.selectionStart).split(", ").length - 1;
    xhrTags.abort().url("/tag/" + parts[curr]).go()
  }

  if (nav.query.get("tags")) document.querySelector("input[data-multiple]").value = nav.query.get("tags").replace(/,/g, ', ');
}

window.addEventListener("load",initTags)
window.addEventListener("init",initTags)
if (document.readyState == 'complete') initTags();
