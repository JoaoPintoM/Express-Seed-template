/*
  Author : Joao Pinto
   - pinto.joao@outlook.com

  based on the work of phildow from OK CODERS
      -> https://github.com/okcoders
*/

'use strict';

module.exports = function(app) {
	var members = require('../controllers/members');

	//todelete
	app.route('/users')
		.get(members.isAuth, members.list);

	app.route('/members/login')
		.get(members.login)
		.post(members.loginPost);

	app.route('/members/register')
		.get(members.register)
		.post(members.registerPost);

	app.route('/members/logout')
		.get(members.logout);

	app.route('/members/forgotpassword')
		.get(members.forgotpassword)
		.post(members.forgotpasswordPost);

	app.route('/members/updatepwd-confirmation/:secret')
		.get(members.updatepwd);

	app.route('/members/new-password')
		.post(members.newpassword);

}
