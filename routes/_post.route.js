const express = require('express');
const admin_router = express.Router();
const config = require('../config/default.json')
const postModel = require('../models/post.model')
const categoryModel = require('../models/category.model')
const tagModel = require('../models/tag.model')
const accountModel = require('../models/account.model')
const upload = require('../utils/upload')

admin_router.get('/add', async function (req, res) {
  const [categoryList,tagList,writer] = await Promise.all([
    categoryModel.all(),
    tagModel.all(),
    accountModel.getByPermisson(2)
  ])
  res.render('vwPost/_add',{
    categoryList,tagList,writer
  });
})

admin_router.post('/add', async function (req, res) {
  req.body.content=''
  req.body.status=1  
  const rows = await postModel.add(req.body)
  const insertId = rows.insertId
  res.json({insertId})
})

admin_router.post('/updateContent-Tag', async (req,res) => {
  const id = req.body.id
  delete req.body.id
  
  const tag = req.body.tag
  if (tag){
    delete req.body.tag
    
    const pt = tag.map(tid=>{
      return [id,tid]
    })
    await Promise.all([
      postModel.patch(req.body,id),
      postModel.setTag([pt])
    ])
  }
  else 
    await postModel.patch(req.body,id)
  
  res.send('ok')
})

admin_router.post('/upload', async (req,res,next) => {
  if (!Number.parseInt(req.query.id))
    return next()
  let location = await upload(req,`post_${req.query.id}_`)
  location = config.site.url+location.substr(1,)
  res.json({location})
})
admin_router.post('/upload/avatar', async (req,res,next) => {
  if (!Number.parseInt(req.query.id))
    return next()
  await upload(req,`post_${req.query.id}_`,1)
  res.redirect('back')
})


admin_router.get('/list', async function (req, res) {
  let page = 1
  
  let postCount = await postModel.count()
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  else if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const postList = await postModel.loadByPage((page-1)*config.pagination)
  
  res.render('vwPost/_list',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})

admin_router.post('/publish', async function (req, res) {
  await postModel.publish(req.body.id)
  res.redirect('back');
})

admin_router.get('/edit/:id', async function (req, res,next) {
  const id = req.params.id
  
  let [postData,categoryList,tagList,writer] = await Promise.all([
    postModel.loadById(id),
    categoryModel.all(),
    tagModel.all(),
    accountModel.getByPermisson(2)
  ])
  
  if (postData.length===0)
    return next()
  postData = postData[0]
  if (postData.tids)
    postData.tags = postData.tids.split(',')
  
  res.render('vwPost/_edit',{
    postData,categoryList,tagList,writer
  })
})

admin_router.post('/edit/:id', async function (req, res) {
  await postModel.patch(req.body,req.params.id)
  res.json({status: 'ok'})
})

admin_router.post('/delete', async function (req, res) {
  await postModel.del(req.body.id)
  res.redirect('back')
})

module.exports = {
  admin_router,
}