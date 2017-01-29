#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var events = require('events');
var inquirer = require('inquirer');

program
	.version('0.0.1')
	.option('-p, --port <n>', 'Listen on port <n>', parseInt)
	.option('-c, --config [file]', 'Load a specified config file [config.json]', 'config.json')
	.option('-a, --add [file]', 'Add an image [image]')
	.parse(process.argv);

var config = require("./config.js");
config = new config(program.config, init);

function init() {
  picto.db.init(postInit);
}

function postInit() {
  if (program.add) {
		var questions = [{
				type: 'input',
				name: 'description',
				message: 'description'
      },{
				type: 'input',
				name: 'info',
				message: 'info (seperate using \'key:value,\')'
      },{
				type: 'input',
				name: 'tags',
				message: 'tags (seperate using \',\')'
      },{
        type: 'confirm',
        name: 'remove',
        message: 'remove the original file',
        default: false
      }
    ];
		inquirer.prompt(questions).then(function(answers) {
			console.log(answers,program.add);
      var id = config.get("lastId")
      config.set("lastId",++id);
      picto.db.add({
        id:id,
        src: program.add,
        tags: answers.tags == "" ? [] : answers.tags.split(","),
        info: answers.info == "" ? [] : answers.info.split(",").map(function(a) {return {key:a.split(":")[0],value:a.split(":")[1]}}),
        description: answers.description
      },answers.remove,process.exit);
		});
		return;
	}

	picto.server.port = program.port || config.get("port");
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
