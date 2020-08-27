const express = require('express');
const router = express.Router();

const DB = require("../database/mysql");
const database = new DB();

router.get('/', (req, res, next) => {
    database.query("SELECT * FROM user", (rows, fields) => {
        res.send(rows);
    });
});

module.exports = router;