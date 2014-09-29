/*
  Author : Joao Pinto
   - pinto.joao@outlook.com

  based on the work of phildow from OK CODERS
      -> https://github.com/okcoders
*/

var express = require('express');
var router = express.Router();

/* 
	OUR PROTECTED RESSOURCE, ONLY AUTH PPL CAN ACCESS IT
		for that purpose we use the method 'isAuth' (as param on router.get)
 */
router.get('/', isAuth, function (req, res) {
	res.render('secrets/index', { title: 'My Amazing secrets'});
});


// simple Middleware to check if auth
function isAuth(req, res, next) {
	// if the user is not auth -> method provided by passport
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must log in before if you want to access that page');

  	// We set a session variable with the url where the user is coming from.
  		req.session.redirect = req.originalUrl;
    	res.redirect('/users/login');
  	} else {
    	next();
  	}
}

module.exports = router;
