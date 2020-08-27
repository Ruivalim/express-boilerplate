const express = require('express');
const router = express.Router();
const logger = require("../utils/Logger");

router.get('/', (req, res) => {
    logger.debug("Index page opened");
    res.send({
        message: process.env.NODE_ENV
    });
});

module.exports = router;