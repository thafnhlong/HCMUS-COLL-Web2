const express = require('express');
const router = express.Router();
const config = require('../config/default.json')
const postModel = require('../models/post.model')
const categoryModel = require('../models/category.model')
const tagModel = require('../models/tag.model')
const accountModel = require('../models/account.model')
const upload = require('../utils/upload')
const pagination = require('../utils/pagination')

const authType = (per) => (req, res, next) => {
  if (per.includes(res.locals.user.permisson))
    return next()
  res.redirect('/dashboard')
}

router.get('/add', authType([2,4]), async function (req, res) {
  let writerListFn=1
  if (res.locals.user.permisson == 4)
    writerListFn = accountModel.getByPermisson(2)
  
  const [[categoryList],tagList,writer] = await Promise.all([
    categoryModel.all(),
    tagModel.all(),
    writerListFn
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

router.post('/updateContent-Tag', authType([2,3,4]), async (req,res) => {
  const id = req.body.id
  delete req.body.id

  if (res.locals.user.permisson==3){
    req.body = {
      tag: req.body.tag,
      cid: req.body.cid,
      status: 2,
      postdate: new Date(req.body.postdate)
    }
  }
  
  const tag = req.body.tag   
  delete req.body.tag
  
  if (tag){
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
  
  res.json({status:'ok'})
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
  const [[page,pv,nv],_,postList] = await pagination(req.query.page,postModel.count,
    (offset) => postModel.loadByPage(offset)
  )
  
  res.render('vwPost/_list',{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})

router.get('/list/:type(seen|unseen|decline)', authType([2]), async function (req, res, next) {
  let type
  switch(req.params.type){
    case 'seen':
      type = 2
      break;
    case 'unseen':
      type = 1
      break;
    case 'decline':
      type = 0
      break;
  }
  
  const uid = res.locals.user.id
  let [[page,pv,nv],_,postList] = await pagination(req.query.page,
    ()=> postModel.countWith(type,uid),
    (offset) => postModel.loadByPageWith(type,uid,offset)
  )
  if (page===0)
    postList = []
  if (type === 2)
    postList.forEach(x=>{
      x.isPublish = x.postdate <= new Date()
    })
  
  res.render(`vwPost/list/_${req.params.type}`,{
    postList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})

router.get('/list/draft', authType([3]), async function (req, res) {  
  const uid = res.locals.user.id
  const [[page,pv,nv],[_,[categoryList]],postList] = await pagination(req.query.page,
    ()=> Promise.all([
      postModel.countWithEditor(uid),
      categoryModel.loadByEditor(uid),
    ]),
    (offset) => postModel.loadByPageWithEditor(uid,offset)
  )
  
  res.render('vwPost/list/_draft',{
    postList,
    categoryList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})
router.get('/check/:id', authType([3]), async function (req, res,next) {
  let [postData,[categoryList,categoryListUnFormat],tagList] = await Promise.all([
    postModel.loadById(req.params.id),
    categoryModel.loadByEditor(res.locals.user.id),
    tagModel.all(),
  ])

  if (postData.length===0 || postData[0].status != 1 || categoryListUnFormat[postData[0].cid] === undefined )
    return next()
  postData = postData[0]
  if (postData.tids)
    postData.tags = postData.tids.split(',')
  
  res.render('vwPost/_check',{
    postData,categoryList,tagList
  })
})
router.post('/decline', authType([3]), async function (req, res) {
  await postModel.decline(req.body.id,req.body.reason)
  res.redirect('/dashboard/post/list/draft');
})

router.post('/publish', authType([4]), async function (req, res) {
  await postModel.publish(req.body.id)
  res.redirect('back');
})

router.get('/edit/:id', authType([2,4]), async function (req, res,next) { 
  let writerListFn=1
  if (res.locals.user.permisson == 4)
    writerListFn = accountModel.getByPermisson(2)
  
  let [postData,[categoryList],tagList,writer] = await Promise.all([
    postModel.loadById(req.params.id),
    categoryModel.all(),
    tagModel.all(),
    writerListFn
  ])
  
  if (postData.length===0 || (res.locals.user.permisson == 2 && (postData[0].writeby != res.locals.user.id || postData[0].status == 2 )) )
    return next()
  postData = postData[0]
  if (postData.tids)
    postData.tags = postData.tids.split(',')
  
  res.render('vwPost/_edit',{
    postData,categoryList,tagList,writer
  })
})
router.post('/edit/:id', authType([2,4]), async function (req, res) {
  if (res.locals.user.permisson == 2)
    req.body.status=1
  await postModel.patch(req.body,req.params.id)
  res.json({status: 'ok'})
})

router.post('/delete', authType([4]), async function (req, res) {
  await postModel.del(req.body.id)
  res.redirect('back')
})

module.exports = router