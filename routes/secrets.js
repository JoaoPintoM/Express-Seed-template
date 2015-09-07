'use strict';

module.exports = function(app) {
	var secrets = require('../controllers/secrets');
	var members = require('../controllers/members');

	app.route('/secrets')
		.get(members.isAuth, secrets.index);
}
