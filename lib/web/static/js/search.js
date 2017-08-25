var xhrTags = new xhr().on("success",function(list) {
  inp.list = list
  inp.evaluate();
});

function initTags() {
  if (location.pathname != "/") return;

  if (typeof Awesomplete === 'undefined' || !document.querySelector("input[data-multiple]")) {
    //console.log("Awesomplete not loaded yet, retrying in 50ms!");
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
    maxItems:30,
    sort: function(a, b) {
      return 0;
    }
  });


  document.querySelector("input[data-multiple]").onkeyup = function(evt) {
    if (evt.keyCode == 13) {
      var tags = this.value.split(", ").filter(a => a != "").join(",")
      return nav.changePath('/' + (tags ? "?q=" + tags : ""),false,true)
    }
    if (evt.keyCode == 38 || evt.keyCode == 40) return;
    var parts = this.value.split(", ")
    var curr = this.value.substring(0,this.selectionStart).split(", ").length - 1;
    xhrTags.abort().url("/tag/" + parts[curr]).go()
  }

  if (nav.query.get("q")) document.querySelector("input[data-multiple]").value = nav.query.get("q").replace(/,/g, ', ');
}

window.addEventListener("init",initTags)
initTags();
