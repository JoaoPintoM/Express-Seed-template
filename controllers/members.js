'use strict';

var User = require('../models/user.js');
var nodemailer = require('nodemailer');

// CONFIG FOR SENDING EMAILS
// Replace my fake email address
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'fake-email@gmail.com',
		pass: 'BaC0n'
	}
});

exports.list = function(req, res) {
	/* GET /users */
	User.find({}).exec(function(err, users) {

		if (err) {
			console.log("db error in GET /users: " + err);
			res.render('500');
		} else {
			// if the user is not auth -> method provided by passport
			//!\\ NOT THE BEST WAY TO CHECK IF USER IS AUTH AT THAT PLACD
			// It should be a function -> see example in secrets route
			if (!req.isAuthenticated()) {
				req.flash('error', 'You must log in before if you want to access that ressource');

				// We set a session variable with the url where the user is coming from.
				req.session.redirect = req.originalUrl;
				res.redirect('/members/login');
			} else {
				//if oK we provide our ressource
				res.send(users);
			}
		}
	});
}


exports.login = function(req, res) {
	return res.render('members/login');
};

exports.loginPost = function(req, res) {
	//Check in the database if user exist
	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) {
			console.log('POST /members/login : ' + err);
			res.render('500');
		}
		//if user don't found or password incorrect
		//-> redirect to login page with error message
		else if (!user || !user.isValidPassword(req.body.password)) {
			req.flash('error', "Email or password is incorrect");
			res.redirect('/members/login');
		}
		//connected -> redirect to home page
		else {

			req.login(user, function(err) {
				if (err) {
					res.render('500');
				} else {

					req.flash('success', "You're now logged in.");

					//if user is coming from a specific url
					if (req.session.redirect) {
						res.redirect(req.session.redirect);
						delete req.session.redirect;
					} else {
						res.redirect('/');
					}
				}
			});
		}
	});
}

exports.register = function(req, res) {
	return res.render('members/register');
}

exports.registerPost = function(req, res) {

	//Verify information provided by user
	//check if user email exists in database
	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) {
			console.log('POST /members/register : ' + err);
			res.render('500');

			//If user exists then we must inform the user
		} else if (user) {
			req.flash('error', 'this email is already in use');
			res.redirect('/members/register');
		}
		//if everything alright then we try to save the user
		else {
			var user = new User();

			user.email = req.body.email;
			user.password = user.generateHash(req.body.password);

			user.save(function(err) {
				if (err) {
					console.log('Cannot save user POST /members/register: ' + err);
					res.render('500');
				}
				//if no error the user is register now, we need to inform the user
				//we log in the user too
				else {
					req.login(user, function(err) {
						if (err) {
							res.render('500');
						} else {
							req.flash('success', "Thank's for signing up! You're now logged in.")
							res.redirect('/');
						}
					});
				}
			});
		}
	});
}

exports.logout = function(req, res) {
	req.logout();
	req.flash('success', "You're now logged out.");
	res.redirect('/');
}

exports.forgotpassword = function(req, res) {
	return res.render('members/forgotpassword');
}

exports.forgotpasswordPost = function(req, res) {
	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) {
			console.log('POST /members/forgotpassword: ' + err);
			req.flash('error', 'something went wrong...');
			res.redirect('/500');
		} else if (!user) {
			req.flash('error', "this email address doesn't exist");
			res.redirect('login');
		} else {
			// !! \\ we should send email and not redirect to that page!!!
			// demo only !!!!

			// encrypt and add salt // we should use the async way of bcrypt.. but meh.
			// we add it to our little user friend, and save it to the db
			user.secret = user.generateHash(user.email);

			user.save(function(err) {
				if (err) {
					console.log('POST save /members/forgotpassword: ' + err);
					req.flash('error', 'something went wrong...');
					res.redirect('/500');
				}

				//small trick, cannot user '/' in the URL
				// then we replace it by a '-' character
				var cleanSecret = user.secret;
				cleanSecret = cleanSecret.replace(/\//g, "-");


				// we send that EMAIL with our suppa secret code
				SendResetPasswordEmail(user.email, cleanSecret);

				res.render('members/sent-email', {
					email: user.email,
					secret: cleanSecret
				});
			});
		}
	});
}


exports.updatepwd = function(req, res) {
	// Replace '-' character by '/' (see /forgotpassword route)
	var secret = req.params.secret;
	secret = secret.replace(/-/g, '/');

	User.findOne({
		secret: secret
	}, function(err, user) {
		if (err) {
			console.log('GET /updatepwd-confirmation /' + err);
			req.flash('error', 'something went wrong');
			res.redirect('/500');
		} else if (!user) {
			req.flash('error', '404. User not found.');
			res.redirect('/404');
		} else {
			req.flash('success', 'Enter your new password please');
			res.render('members/new-password', {
				email: user.email,
				secret: user.secret
			});
		}
	});
}

exports.newpassword = function(req, res) {
	User.findOne({
		email: req.body.email,
		secret: req.body.secret
	}, function(err, user) {

		if (err) {
			console.log('POST /new-password : ' + err);
			req.flash('error', 'something went wrong');
			res.redirect('/500');
		} else if (!user) {
			req.flash('error', '404. User not found.');
			res.redirect('/404');
		}
		// if OK
		user.password = user.generateHash(req.body.password);
		user.secret = null;

		user.save(function(err) {
			if (err) {
				console.log('POST SAVE /new-password : ' + err);
				req.flash('error', 'something went wrong');
				res.redirect('/500');
			}

			req.flash('success', 'password updated, please login with your new password');
			res.redirect('login');
		});
	});
}


// simple Middleware to check if auth
exports.isAuth = function(req, res, next) {
	// if the user is not auth -> method provided by passport
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must log in before if you want to access that page');

		// We set a session variable with the url where the user is coming from.
		req.session.redirect = req.originalUrl;
		res.redirect('/members/login');
	} else {
		next();
	}
}


function SendResetPasswordEmail(userAddress, secret) {
	transporter.sendMail({
		from: 'stagounet@gmail.com',
		to: userAddress,
		subject: 'Next project : [PASSWORD request]',
		text: " Hello! \n\r \
If you have requested to reset your current password \n\r \
please click on the following link : \n\r \
http://localhost:3000/users/updatepwd-confirmation/" + secret + ""
	});
}
