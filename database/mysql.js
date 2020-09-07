const mysql = require("mysql");
const logger = require("../utils/Logger");

class DB{
	constructor(){
		this.connection = null;
	}

	start(){
		return new Promise((resolve, reject) => {
			this.connection = mysql.createConnection({
				host: process.env.MYSQL_HOST     || 'localhost',
				user: process.env.MYSQL_USER     || 'root',
				password: process.env.MYSQL_PASS || 'root',
				database: process.env.MYSQL_NAME || '',
				port: process.env.MYSQL_PORT     || 3306
			});

			this.connection.connect((err) => {
				if (err) {
					logger.error("Error while trying to connect to database.");
					reject(err.stack);
				}else{
					logger.info("Database connection started succesfully.");
					resolve();
				}
			});
		});
	}

	query(query, callback){
		this.start().then(() => {
			logger.info("Performing query: " + query);
			return this.connection.query(query, (err, rows, fields) => {
				if (err) {
					logger.error("Error while trying to query database.");
					logger.error(err.stack);

					return null;
				}
				callback(rows, fields);
			});
		}).then(() => {
			this.close();
		}).catch((err) => {
			logger.error(err);
		});
	}

	close(){
		logger.info("Closing database connection.");
		this.connection.end();
	}
}

module.exports = DB;
