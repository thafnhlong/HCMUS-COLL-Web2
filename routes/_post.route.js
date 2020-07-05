const express = require('express');
const router = express.Router();
const config = require('../config/default.json')
const postModel = require('../models/post.model')
const categoryModel = require('../models/category.model')
const tagModel = require('../models/tag.model')
const accountModel = require('../models/account.model')
const upload = require('../utils/upload')

const authType = (per) => (req, res, next) => {
  if (per.includes(res.locals.user.permisson))
    return next()
  res.redirect('/dashboard')
}

router.get('/add', authType([2,4]), async function (req, res) {
  const [[categoryList],tagList,writer] = await Promise.all([
    categoryModel.all(),
    tagModel.all(),
    accountModel.getByPermisson(2)
  ])
  res.render('vwPost/_add',{
    categoryList,tagList,writer
  });
})

router.post('/add', authType([2,4]), async function (req, res) {
  if (res.locals.user.permisson==2){
    req.body.writeby= res.locals.user.id
    req.body.views= 0
  }
  req.body.content=''
  req.body.status=1  
  const rows = await postModel.add(req.body)
  const insertId = rows.insertId
  res.json({insertId})
})

router.post('/updateContent-Tag', authType([2,4]), async (req,res) => {
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

router.post('/upload', authType([2,4]), async (req,res,next) => {
  if (!Number.parseInt(req.query.id))
    return next()
  let location = await upload(req,`post_${req.query.id}_`)
  location = config.site.url+location.substr(1,)
  res.json({location})
})
router.post('/upload/avatar', authType([2,4]), async (req,res,next) => {
  if (!Number.parseInt(req.query.id))
    return next()
  await upload(req,`post_${req.query.id}_`,1)
  res.redirect('back')
})

router.get('/list', authType([4]), async function (req, res) {
  let page = 1
  
  let postCount = await postModel.count()
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
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

router.get('/list/seen', authType([2]), async function (req, res) {
  let page = 1
  
  const uid = res.locals.user.id
  let postCount = await postModel.countWith(2,uid)
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const postList = await postModel.loadByPageWith(2,uid,(page-1)*config.pagination)
  postList.forEach(x=>{
    x.isPublish = x.postdate <= new Date()
  })
  
  res.render('vwPost/list/_seen',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})
router.get('/list/unseen', authType([2]), async function (req, res) {
  let page = 1
  
  const uid = res.locals.user.id
  let postCount = await postModel.countWith(1,uid)
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const postList = await postModel.loadByPageWith(1,uid,(page-1)*config.pagination)
  postList.forEach(x=>{
    x.isPublish = x.postdate <= new Date()
  })
  
  res.render('vwPost/list/_unseen',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})
router.get('/list/decline', authType([2]), async function (req, res) {
  let page = 1
  
  const uid = res.locals.user.id
  let postCount = await postModel.countWith(0,uid)
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const postList = await postModel.loadByPageWith(0,uid,(page-1)*config.pagination)
  postList.forEach(x=>{
    x.isPublish = x.postdate <= new Date()
  })
  
  res.render('vwPost/list/_decline',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})



router.get('/list/draft', authType([3]), async function (req, res) {
  let page = 1
  
  let postCount = await postModel.countWith(1,res.locals.user.id)
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.query.page)
    page = +req.query.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const postList = await postModel.loadByPageWith(1,(page-1)*config.pagination)
  
  res.render('vwPost/_list',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})



router.post('/publish', authType([4]), async function (req, res) {
  await postModel.publish(req.body.id)
  res.redirect('back');
})

router.get('/edit/:id', authType([2,4]), async function (req, res,next) {
  const id = req.params.id
  
  let [postData,[categoryList],tagList,writer] = await Promise.all([
    postModel.loadById(id),
    categoryModel.all(),
    tagModel.all(),
    accountModel.getByPermisson(2)
  ])
  
  if (postData.length===0 || postData[0].writeby != res.locals.user.id
  || postData[0].status == 2
  )
    return next()
  postData = postData[0]
  if (postData.tids)
    postData.tags = postData.tids.split(',')
  
  res.render('vwPost/_edit',{
    postData,categoryList,tagList,writer
  })
})

router.post('/edit/:id', authType([2,4]), async function (req, res) {
  await postModel.patch(req.body,req.params.id)
  res.json({status: 'ok'})
})

router.post('/delete', authType([4]), async function (req, res) {
  await postModel.del(req.body.id)
  res.redirect('back')
})

module.exports = router