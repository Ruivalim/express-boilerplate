const path = require('path');
const rfs = require('rotating-file-stream')
const colors = require('colors');
const moment = require("moment");
const notifier = require('node-notifier');

const logLevel = process.env.LOG_LEVEL;
let logLevelNumber = 0;

if( logLevel == "all" ){
	logLevelNumber = 5;
}
if( logLevel == "debug" ){
	logLevelNumber = 4;
}
if( logLevel == "info" ){
	logLevelNumber = 3;
}
if( logLevel == "warn" ){
	logLevelNumber = 2;
}
if( logLevel == "error" ){
	logLevelNumber = 1;
}
if( logLevel == "none" ){
	logLevelNumber = 0;
}

const errorLogStream = rfs.createStream('error.log', {
	interval: '1d',
	path: path.join(__dirname, '../logs')
});
const warnLogStream = rfs.createStream('warn.log', {
	interval: '1d',
	path: path.join(__dirname, '../logs')
});
const infoLogStream = rfs.createStream('info.log', {
	interval: '1d',
	path: path.join(__dirname, '../logs')
});
const debugLogStream = rfs.createStream('debug.log', {
	interval: '1d',
	path: path.join(__dirname, '../logs')
});

const constructMessage = (message) => {
	if ( typeof message == "object" ){
		let cache = [];
		message = JSON.stringify(message, (key, value) => {
			if (typeof value === 'object' && value !== null) {
				if (cache.includes(value)) return;
				cache.push(value);
			}
			return value;
		});
		cache = null;
	}

	return "[" + moment().format(this.format) + "] " + message;
}

const logger = {
	format: "DD/MMM/YYYY:HH:mm:ss",
	error: (message) => {
		if( 1 > logLevelNumber ){ return; }
		const msg = constructMessage(message);
		errorLogStream.write(msg+"\n");
		console.log(colors.red(msg));
	},
	warn: (message) => {
		if( 2 > logLevelNumber ){ return; }
		const msg = constructMessage(message);
		warnLogStream.write(msg+"\n");
		console.log(colors.yellow(msg));
	},
	info: (message) => {
		if( 3 > logLevelNumber ){ return; }
		const msg = constructMessage(message);
		infoLogStream.write(msg+"\n");
		console.log(colors.cyan(msg));
	},
	debug: (message) => {
		if( 4 > logLevelNumber ){ return; }
		const msg = constructMessage(message);
		debugLogStream.write(msg+"\n");
		console.log(colors.magenta(msg));
	},
	log: (message) => {
		const msg = constructMessage(message);
		if (process.env.NODE_ENV === 'development') {
			notifier.notify({
				title: process.env.APP_NAME || "App server",
				message: msg
			});
		}
		console.log(colors.white(msg));
	}
}

module.exports = logger;
