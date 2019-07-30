const isNotLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/people');
};

module.exports = isNotLoggedIn;