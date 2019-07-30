'use strict'

const express = require('express');
const router = express.Router();
const base64 = require('node-base64-image');

router.post('/img64', (req, res) => {
	base64.encode(req.body.url, {string:true}, (err, result) => {
		if (err) throw err;
		res.send(result);
	});
});

module.exports = router;