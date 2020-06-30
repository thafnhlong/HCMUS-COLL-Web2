const express = require('express');
const router = express.Router();

router.get('/add', function (req, res) {
  res.render('vwAccount/_edit');
})
router.get('/list', function (req, res) {
  res.render('vwAccount/_edit');
})
router.get('/edit/:id', function (req, res) {
  res.render('vwAccount/_edit');
})

module.exports = router