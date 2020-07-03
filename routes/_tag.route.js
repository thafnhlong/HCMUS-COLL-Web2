const express = require('express');
const router = express.Router();
const config = require('../config/default.json')
const tagModel = require('../models/tag.model')


router.get('/add', function (req, res) {
  res.render('vwTag/_add');
})

router.post('/add', async function (req, res) {
  await tagModel.add(req.body)
  res.redirect('back')
})

router.get('/list', async function (req, res) {
  let page = 1
  
  let tagCount = await tagModel.count()
  tagCount=tagCount[0].count
  const maxPage = Math.ceil(+tagCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const tagList = await tagModel.loadByPage((page-1)*config.pagination)
  
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