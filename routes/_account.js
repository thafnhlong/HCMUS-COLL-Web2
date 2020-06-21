const express = require('express');
const router = express.Router();

router.get('/edit', function (req, res) {
  res.render('vwAccount/edit');
})

module.exports = router