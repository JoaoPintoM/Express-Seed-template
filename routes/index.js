var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('/500', function(req, res) {
  res.render('500');
});


/* GET home page. */
router.get('/404', function(req, res) {
  res.render('404');
});

module.exports = router;
