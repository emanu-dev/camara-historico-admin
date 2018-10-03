'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('../models/user.model');

const isNotLoggedIn = require('../middlewares/notlogged.js');

const isLoggedIn = (req, res, next) =>{
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

//AUTH
router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('user/register');
        }
        passport.authenticate('local')(req, res, () => {
           res.redirect('/people'); 
        });
    });
});

router.get('/login', isNotLoggedIn, (req, res) => {
   res.render('index'); 
});

router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/people',
        failureRedirect: '/',
    }), (req, res) => {

        // console.log('Não foi possível realizar o login, por favor verifique seu usuário e senha');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;