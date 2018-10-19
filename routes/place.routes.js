'use strict'

const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const fs = require('fs');
const cloudinary = require('cloudinary');
const formidable = require('formidable');

const isLoggedIn = require('../middlewares/logged.js');
const Places = require('../models/place.model.js');

const path = 'http://camaraitapetininga.netlify.com/?data=historia&id=';

cloudinary.config({
	cloud_name: 'du4ylhbnk',
	api_key: '663459838219162', 
	api_secret: '2657rKR89tYHYKOZ5xPKvZd4ZMM'
});

router.get('/showplace/:id', (req, res) => {
	Places.findById(req.params.id, (err, foundPlace) => {
		if (err) {
			console.log(err);
			res.send(err);
		}else{
			res.send(foundPlace);
		}
	});
});

router.get('/places/gallery', (req, res) => {
	Places.find({}, (err, places) => {
		if (err) {
			console.log(err);
		}else {
			places.forEach((place) => {
				let qrImg = qr.imageSync(`${path}${place._id}`, { type: 'png' });
				let qr64 = `data:image/png;base64,${qrImg.toString('base64')}`;
				place.qr = qr64; 
			});
			res.send(places);
		}
	});
});

router.get('/places', isLoggedIn, (req, res) => {
	Places.find({}, (err, places) => {
		if (err) {
			console.log(err);
		}else {
			places.forEach((place) => {
				let qrImg = qr.imageSync(`${path}${place._id}`, { type: 'png' });
				let qr64 = `data:image/png;base64,${qrImg.toString('base64')}`;
				place.qr = qr64; 
			});
			res.render('places/index', {places:places});		
		}
	});
});

router.get('/places/new', isLoggedIn, (req, res) => {
	res.render('places/new');
});

router.post('/places', isLoggedIn, (req, res) => {
	Places.create(req.body.place, (err, newPlace) =>{
		if (err) {
			console.log(err);
		}else{
			res.redirect('/places');
		}
	});
});

router.get('/places/:id', isLoggedIn, (req, res) => {
	Places.findById(req.params.id, (err, foundPlace) => {
		if (err) {
			console.log(err);
			res.send(err);
		}else{
			res.render('places/show', {place:foundPlace});
		}
	});
});



router.get('/places/:id/edit', isLoggedIn, (req, res) => {
	Places.findById(req.params.id, (err, foundPlace) => {
		if (err) {
			console.log(err);
		}else{
			res.render('places/edit', {place:foundPlace});
		}
	});
});

router.put('/places/:id', isLoggedIn, (req, res) => {
	const form = new formidable.IncomingForm();
	
	form.parse(req, (err, fields, files) => {

		if (fields.imagechange != 'n') {
			cloudinary.v2.uploader.upload(files.picture.path, (error, result) => {
				
				fs.unlink(files.picture.path, function(error) {
				    if (error) {
				        throw error;
				    }
				    console.log('Deleted temporary upload');
				});

				console.log(result, error);

				Places.findByIdAndUpdate(req.params.id, {$set: {
					name: fields.name,
					text: fields.text,
					picture: result.secure_url,
					modifiedAt: new Date()
				}}, (err, updatedPerson) => {
					if (err) {
						console.log(err);
					}else {
						res.redirect(`/places/${req.params.id}`);
					}
				});
			});			
		} else {
			Places.findByIdAndUpdate(req.params.id, {$set: {
				name: fields.name,
				text: fields.text,
				modifiedAt: new Date()
			}}, (err, updatedPerson) => {
				if (err) {
					console.log(err);
				}else {
					res.redirect(`/places/${req.params.id}`);
				}
			});
		}
	});
});

router.delete('/places/:id', isLoggedIn, (req, res) => {
	Places.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			console.log(err);
		}else {
			res.redirect('/places');
		}
	});
});

module.exports = router;