const express = require('express');
const accountmd = require('../models/account.model')
const router = express.Router();
const config = require('../config/default.json')
const pagination = require('../utils/pagination')

router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  res.redirect('/dashboard')
})

router.get('/add', function (req, res) {
  
  res.render('vwAccount/_add');
})


router.get('/list', async function (req, res) {
  const [[page,pv,nv],_,accList] = await pagination(req.query.page,accountmd.count,
    (offset) => accountmd.loadByPage(offset)
  )
  
  res.render('vwAccount/_list',{
    accList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})


router.get('/edit/:id', function (req, res) {
  res.render('vwAccount/_edit');
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
module.exports = router