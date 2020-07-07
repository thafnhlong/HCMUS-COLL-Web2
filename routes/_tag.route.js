const express = require('express');
const router = express.Router();
const tagModel = require('../models/tag.model')
const pagination = require('../utils/pagination')


router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  res.redirect('/dashboard')
})

router.get('/add', function (req, res) {
  res.render('vwTag/_add');
})

router.post('/add', async function (req, res) {
  await tagModel.add(req.body)
  res.redirect('back')
})

router.get('/list', async function (req, res) {
  const [[page,pv,nv],_,tagList] = await pagination(req.query.page,tagModel.count,
    (offset) => tagModel.loadByPage(offset)
  )
  
  res.render('vwTag/_list',{
    tagList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})


router.get('/edit/:id', async function (req, res,next) {
  const id = req.params.id
  let tagData = await tagModel.loadById(id)
  if (tagData.length===0)
    return next()
  
  tagData=tagData[0]
  res.render('vwTag/_edit',{tagData})
})

router.post('/edit/:id', async function (req, res) {
  const id = req.params.id
  await tagModel.patch(req.body,id)
  res.redirect('back');
})

router.post('/delete', async function (req, res) {
  await tagModel.del(req.body.id)
  res.redirect('back')
})

module.exports = router