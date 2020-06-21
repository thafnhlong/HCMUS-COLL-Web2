const express = require('express');
const router = express.Router();

router.use(async function (req, res, next) {
  res.locals.layout = '_main'
  next()
})

router.get('/',(req,res) => {
  res.redirect('/dashboard/account/edit')
})

router.use('/account',require('./_account'))


router.use(function (req, res) {
  res.status(404).send('404 not found');
})

router.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('500 error found');
})

module.exports = router;