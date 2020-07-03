const express = require('express');
const accountmd = require('../models/account.model')
const router = express.Router();
const config = require('../config/default.json')

router.get('/add', function (req, res) {
  
  res.render('vwAccount/_add');
})


router.get('/list', async function (req, res) {
  let page = 1
  
  let accCount = await accountmd.count()
  accCount=accCount[0].count
  const maxPage = Math.ceil(+accCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  else if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const accList = await accountmd.loadByPage((page-1)*config.pagination)
  
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