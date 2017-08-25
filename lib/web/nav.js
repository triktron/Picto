var nav = {}

nav.init = function(web) {
  nav.web = web;
  nav.list = {
    top: [
			{path:"user",icon:"account_circle"},
			{path:"",icon:"insert_photo"},
			{path:"share",icon:"share"}
		],
		bottom: [
			{path:"settings",icon:"settings"}
		]
  }

  return nav;
}

nav.add = function(path, icon, gravety = "top") {
  nav.list[gravety] = {
    path: path,
    icon: icon
  }
}

module.exports = nav.init;
