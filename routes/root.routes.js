'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index');
});

// const User = require('../models/user.model.js');



module.exports = router;