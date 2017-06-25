#!/usr/bin/env node


var fs = require('fs-extra');
var events = require('events');
var inquirer = require('inquirer');
var glob = require("glob")
var path = require('path');

var preventStarting = false;
var argv = require('yargs')
.default('config', "config.json")
  .alias('c', 'config')
  .usage('$0 <cmd> [args]')
  .command('add [files]', 'add an image', {
      description: {
        alias: 'd',
				default: null
      },
      info: {
        alias: 'i',
				default: ''
      },
			tags: {
				alias: 't',
				default: null
			},
			remove: {
				alias: 'r',
				default: false
			}
    }, function(argv) {
      preventStarting = function() {
				var questions = []

				if (!argv.files) {
	        questions.push({
	          type: 'input',
	          name: 'files',
	          message: 'the files to add'
	        })
	      }

	      if (argv.description == null) {
	        questions.push({
	          type: 'input',
	          name: 'description',
	          message: 'description'
	        })
	      }

	      if (argv.tags == null) {
	        questions.push({
		          type: 'input',
		          name: 'tags',
		          message: 'tags (seperate using \',\')'
		        })
	      }


	     	inquirer.prompt(questions).then(function(answers) {

					var baseSettings = {
		        tags: (argv.tags || answers.tags != null) ? (argv.tags || answers.tags).split(",") : [],
		        info: [{key:"file-name"}].concat(argv.info ? argv.info.split(",").map(function(a) {
		          return {
		            key: a.split(":")[0],
		            value: a.split(":")[1]
		          }
		        }) : []),
		        description: argv.description || answers.description || ""
		      };

				glob(argv.files || answers.files, function(er, files) {
          Promise.all(files.map(function(file) {
            var id = config.get("lastId")
						config.set("lastId", ++id);
						baseSettings.id = id;
						baseSettings.src = file;
            baseSettings.info[0].value = path.basename(file);
						return picto.db.add(baseSettings, argv.remove, false)
          })).then(function() {
            console.log("done");
            picto.db.save()
          })
				})
    });
	};
}).command('purge-database [name]', 'cleans a database', {}, function(argv) {
	preventStarting = function() {
		fs.emptyDirSync(config.get("database") + "images")
		fs.emptyDirSync(config.get("database") + "thumbs")
		fs.removeSync(config.get("database") + "db.json")
		config.set("lastId",0)
	}
})
.help()
  .argv


var config = require("./config.js");
config = new config(argv.config, init);

function init() {
  picto.db.init(postInit);
}

function postInit() {
  picto.server.port = argv.port || config.get("port");
	if (preventStarting) return preventStarting();
	picto.emit("init")
}

function picto() {
  events.EventEmitter.call(this);

  this.dirname = __dirname;
  this.config = config;

  this.extend = function(name, func) {
    this[name] = func;
  }
}

picto.prototype.__proto__ = events.EventEmitter.prototype;
var picto = new picto()

fs.readdirSync(__dirname + '/plugins/').forEach(function(file) {
  if (file.match(/\.js$/) !== null) {
    var name = file.replace('.js', '');
    var s = require(__dirname + '/plugins/' + file);
    if (s.preInit) s.preInit(picto)
  }
});
