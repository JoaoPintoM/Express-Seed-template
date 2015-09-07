'use strict';


exports.home = function(req, res) {
  res.render('index', { title: 'Express', name: 'Ata' });
};

exports.notFound = function(req, res){
  res.render('404');
}

exports.error505 = function(req, res){
  res.render('500');
}

// /* GET home page. */
// router.get('/500', function(req, res) {
//   res.render('500');
// });


// /* GET home page. */
// router.get('/404', function(req, res) {
//   res.render('404');
// });
