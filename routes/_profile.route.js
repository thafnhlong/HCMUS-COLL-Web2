const express = require('express');
const router = express.Router();
const moment = require('moment');
const accountModel = require('../models/account.model')
const bcrypt = require('bcryptjs')
const config = require('../config/default.json');

router.get('/edit', function (req, res) {
  res.render('vwAccount/_profile');
})
router.post('/update', function (req, res) {
  const entity = {
    id: res.locals.user.id,
    name: req.body.name,
    pseudonym: req.body.pseudonym,
    dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD')
  }
  accountModel.patch(entity)
  req.session.user.cacheExpired = 0
  res.redirect('back')
})
router.post('/pass', function (req, res) {
  
  const rs = bcrypt.compareSync(req.body.password, res.locals.user.password);
  if (rs === false) {
    return res.redirect('./edit#error:Mat khau cu khong chinh xac')
  }
  
  const password_hash = bcrypt.hashSync(req.body.newpassword, config.authentication.saltRounds);
  const entity = {
    id: res.locals.user.id,
    password: password_hash
  }
  accountModel.patch(entity)
  res.redirect('back')
})



module.exports = router