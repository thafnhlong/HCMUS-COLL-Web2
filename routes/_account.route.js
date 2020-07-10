const express = require('express');
const accountmd = require('../models/account.model')
const router = express.Router();
const config = require('../config/default.json')
const pagination = require('../utils/pagination')
const categoryModel = require('../models/category.model')

router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  res.redirect('/dashboard')
})

router.get('/add', function (req, res) {
  
  res.render('vwAccount/_add');
})


router.get('/list', async function (req, res) {
  const [[page,pv,nv],_,[accList,categoryList]] = await pagination(req.query.page,accountmd.count,
    (offset) => Promise.all([
      accountmd.loadByPage(offset),
      categoryModel.loadParent()
    ])
  )
  
  res.render('vwAccount/_list',{
    accList,
    categoryList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})

router.get('/manage',async (req,res,next)=>{
  if (!req.query.id)
    return next()
  res.json(await categoryModel.getByEditor(req.query.id))
})

router.post('/manage',async (req,res,next)=>{
  const id = req.body.id
  const cids = req.body.cids
  let entity = [[id]]
  if (Array.isArray(cids))
    entity = cids.map(x=>[id,x])
  else if (typeof cids === 'string')
    entity[0][1] = cids
  await categoryModel.setForEditor([entity])
  res.redirect('back')
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