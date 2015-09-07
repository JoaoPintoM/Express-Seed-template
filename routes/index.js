'use strict';

module.exports = function(app) {
  var index = require('../controllers/index');

  app.route('/')
    .get(index.home);

  app.route('/404').get(index.notFound);

  app.route('/505').get(index.error505);
}
