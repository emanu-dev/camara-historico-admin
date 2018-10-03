'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');

const app = express();

const rootRoutes = require('./routes/root.routes');
const personRoutes = require('./routes/person.routes');
const placeRoutes = require('./routes/place.routes');
const userRoutes = require('./routes/user.routes');
const utilRoutes = require('./routes/util.routes');

const User = require('./models/user.model');

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://admin:camara1771@ds125602.mlab.com:25602/camara', { useNewUrlParser: true });

app.use(require('express-session') ({
	secret: 'lalulilelo',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.user);
    res.locals.currentUser = req.user;
    next();
});

app.use('/', rootRoutes);
app.use('/', personRoutes);
app.use('/', placeRoutes);
app.use('/utils', utilRoutes);
app.use('/', userRoutes);


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});