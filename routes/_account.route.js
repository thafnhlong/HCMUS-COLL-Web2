const express = require('express');
const accountmd = require('../models/account.model')
const router = express.Router();
const config = require('../config/default.json')
const bcrypt = require('bcryptjs');
const moment = require('moment');

router.get('/add', function (req, res) {

  res.render('vwAccount/_add');
})


router.get('/list', async function (req, res) {
  let page = 1

  let accCount = await accountmd.count()
  accCount = accCount[0].count
  const maxPage = Math.ceil(+accCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1
  const pv = page > 1
  const nv = page < maxPage

  const accList = await accountmd.loadByPage((page - 1) * config.pagination)

  res.render('vwAccount/_list', {
    accList,
    page,
    pag: pv || nv,
    prev: { isValid: pv, page: page - 1 },
    next: { isValid: nv, page: page + 1 },
  });
})


router.get('/edit/:id',async function (req, res) {
  const account= await accountmd.singleByID(req.params.id);
  account.dob=moment(account.dob).format("DD/MM/YYYY");
  res.render('vwAccount/_edit',{account});
})

router.post('/extend', async function (req, res) {
  await accountmd.extend(req.body.id)
  res.redirect('back')
})

router.post('/extend', async function (req, res) {
  await accountmd.extend(req.body.id)
  res.redirect('back')
})

router.post('/delete', async function (req, res) {
  await accountmd.del(req.body.id)
  res.redirect('back')
})

router.post('/add', async function (req, res) {
  const account = {
    name: req.body.name,
    email: req.body.email,
    dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    permisson: req.body.permission,
  }
  const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
  account.password = password_hash

  if (req.body.permisson == '1') {
    account.expired = moment().add(7, 'days').toDate();
  }
  if (req.body.permisson == '2') {
    account.pseudonym = req.body.pseudonym;
  }
  await accountmd.add(account);
  res.redirect('/dashboard/account/list')
})

router.get('/is-available', async function (req, res) {
  const user = await accountmd.singleByEmail(req.query.user);
  if (!user) {
    return res.json(true);
  }
  res.json(false);
})

router.post('/edit',async function (req, res) {
  const account = {
    id:req.body.id,
    name: req.body.name,
    email: req.body.email,
    dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    permisson: req.body.permission,
  }
  const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
  account.password = password_hash

  if (req.body.permisson == '1') {
    account.expired = moment().add(7, 'days').toDate();
  }
  if (req.body.permisson == '2') {
    account.pseudonym = req.body.pseudonym;
  }
  await accountmd.patch(account);
  res.redirect('/dashboard/account/list');
})

module.exports = router