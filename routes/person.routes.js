'use strict'

const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const fs = require('fs');
const cloudinary = require('cloudinary');
const formidable = require('formidable');

const isLoggedIn = require('../middlewares/logged.js');
const People = require('../models/person.model.js');

const path = 'http://camaraitapetininga.netlify.com/?data=vereador&id=';

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET
});

router.get('/people/gallery', (req, res) => {
	People.find({}, (err, people) => {
		if (err) {
			console.log(err);
		}else {
			let newPeople = [];
			people.forEach((person) => {
				let qrImg = qr.imageSync(`${path}${person._id}`, { type: 'png' });
				let qr64 = `data:image/png;base64,${qrImg.toString('base64')}`;
				person['qr'] = qr64; 

				let newPerson = {
					title : person.title,
					name :  person.name,
					picture : person.picture,
					period: person.period,
					qr : qr64
				};

				newPeople.push(newPerson);
			});

			res.send(newPeople);
		}
	});
});

router.get('/showperson/:id', (req, res) => {
	People.findById(req.params.id, (err, foundPerson) => {
		if (err) {
			console.log(err);
			res.send(err);
		}else{
			res.send(foundPerson);
		}
	});
});

router.get('/people', isLoggedIn, (req, res) => {
	People.find({}, (err, people) => {
		if (err) {
			console.log(err);
		}else {
			people.forEach((person) => {
				let qrImg = qr.imageSync(`${path}${person._id}`, { type: 'png' });
				let qr64 = `data:image/png;base64,${qrImg.toString('base64')}`;
				person.qr = qr64; 
			});
			res.render('people/index', {people:people});		
		}
	});
});

router.get('/people/new', isLoggedIn, (req, res) => {
	res.render('people/new');
});

router.post('/people', isLoggedIn, (req, res) => {
	People.create(req.body.person, (err, newPerson) =>{
		if (err) {
			console.log(err);
		}else{
			res.redirect('/people');
		}
	});
});

router.get('/people/:id', isLoggedIn, (req, res) => {
	People.findById(req.params.id, (err, foundPerson) => {
		if (err) {
			res.send(err);
		}else{
			res.render('people/show', {person:foundPerson});
		}
	});
});

router.get('/people/:id/edit', isLoggedIn, (req, res) => {
	People.findById(req.params.id, (err, foundPerson) => {
		if (err) {
			console.log(err);
		}else{
			res.render('people/edit', {person:foundPerson});
		}
	});
});

router.get('/people/:id/qr', isLoggedIn, (req, res) => {
	People.findById(req.params.id, (err, foundPerson) => {
		if (err) {
			res.send(err);
			res.render('qrview', {error:'Item não encontrado', qrcode:null});
		}else{
			let qrImg = qr.imageSync(`${path}${foundPerson._id}`, { type: 'png' });
			let qr64 = `data:image/png;base64,${qrImg.toString('base64')}`;
			res.render('qrview', {error:null, qrcode:qr64});
		}
	});
});

router.put('/people/:id', isLoggedIn, (req, res) => {
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

				People.findByIdAndUpdate(req.params.id, {$set: {
					name: fields.name,
					title: fields.title,
					text: fields.text,
					picture: result.secure_url,
					modifiedAt: new Date()
				}}, (err, updatedPerson) => {
					if (err) {
						req.flash('error', 'Não foi possível atualizar os dados');
						res.redirect(`/people/${req.params.id}`);
					}else {
						req.flash('success', 'Dados atualizados com sucesso!');
						res.redirect(`/people/${req.params.id}`);
					}
				});
			});			
		} else {
			People.findByIdAndUpdate(req.params.id, {$set: {
				name: fields.name,
				title: fields.title,
				text: fields.text,
				modifiedAt: new Date()
			}}, (err, updatedPerson) => {
				if (err) {
					req.flash('error', 'Não foi possível atualizar os dados');
					res.redirect(`/people/${req.params.id}`);
				}else {
					req.flash('success', 'Dados atualizados com sucesso!');
					res.redirect(`/people/${req.params.id}`);
				}
			});
		}
	});

});

router.delete('/people/:id', isLoggedIn, (req, res) => {
	People.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			console.log(err);
		}else {
			res.redirect('/people');
		}
	});
});

function base64_encode(file) {
    // read binary data
    // var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(file).toString('base64');
}

module.exports = router;