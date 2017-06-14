function updateSettings() {
  if (location.pathname != "/settings") return;

  document.querySelector('.port').value = location.port;

  document.querySelector('.port').addEventListener("keyup",checkPort);
  document.querySelector('.port').addEventListener("change",checkPort);
  document.querySelector(".port + input").addEventListener("click",changePort);
}

var portChecker = new xhr().on("success",function(isFree) {
  console.log(isFree);
  document.querySelector('.port').classList[isFree ? "add" : "remove"]("unavalible")
});
function checkPort() {
  portChecker.abort().url("/checkPort/" + document.querySelector('.port').value).go();
}

function changePort() {
  var port = document.querySelector('.port').value;
  new xhr().url("/changePort/" + port).on("success",function() {
    location.port = port;
  }).go();
}

window.addEventListener("load",updateSettings)
window.addEventListener("init",updateSettings)
if (document.readyState == 'complete') updateSettings();
