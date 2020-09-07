'use strict';

//console.log("Listing all enviroment variables.")
//console.log(process.env);

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require("helmet");
const cors = require('cors');
const path = require('path');
const rfs = require('rotating-file-stream');
const notifier = require('node-notifier');
const errorhandler = require('errorhandler');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const optimus = require('connect-image-optimus');
const nunjucks = require('nunjucks');

const routes = require("./routes");

// Upload docs https://github.com/expressjs/multer

// Using .env file
require('dotenv').config();

// logger
const logger = require("./utils/Logger");

// Allowed List
const allowlist = [];

// CORS OPTIONS
const corsOptionsDelegate = (req, callback) => {
	let corsOptions;
	if (allowlist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}

	callback(null, corsOptions);
}

// HTTP LOGS FILE
const accessLogStream = rfs.createStream('access.log', {
	interval: '1d',
	path: path.join(__dirname, 'logs')
});

// Getting PORT and HOST from env
const PORT = process.env.APP_PORT || 8080;
const HOST = process.env.APP_HOST || '0.0.0.0';

// Express init
const app = express();

// Nunjucks config
nunjucks.configure('views', {
	autoescape: true,
	express: app,
	watch: true
});

// Nunjucks init
app.set('view engine', '.njk')

// Express Middlewares initialization
app.use(helmet());
// Body Parser init
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// HTTP LOGGER
app.use(morgan('combined', {stream: accessLogStream}));
// Cookie Parser
app.use(cookieParser());

// If allowd list is empty, will use the default cors config
if( allowlist.length == 0 ){
	app.use(cors());
}else{
	app.use(cors(corsOptionsDelegate));
}

// Only in Dev plugins
if (process.env.NODE_ENV === 'development') {
	// Error handling
	const errorHandler = (err, str, req) => {
		const title = 'Error in ' + req.method + ' ' + req.url;

		notifier.notify({
			title: title,
			message: str
		});
	}
	app.use(errorhandler({ log: errorHandler }));
}
// Only in Prod plugins
if (process.env.NODE_ENV === 'production') {
	// gzip Compression
	const shouldCompress = (req, res) => {
		if (req.headers['x-no-compression']) { return false; }
		return compression.filter(req, res);
	}
	app.use(compression({ filter: shouldCompress }));
}

const staticPath = __dirname + '/public/';

// Imges compression
app.use(optimus(staticPath));
// Static files
app.use(express.static(staticPath));

// Autorouting
Object.entries(routes).forEach(([key, value]) => {
	const routeFile = require('./routes/'+value);
	app.use(key, routeFile);
});

// App initialization
app.listen(PORT, HOST);
logger.log("App Started.");
