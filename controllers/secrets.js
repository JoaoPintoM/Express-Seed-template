'use strict';

exports.index = function(req, res) {
	res.render('secrets/index', {
		title: 'My Amazing secrets'
	});
}
