const express = require('express');
const router = express.Router();
const categoryModel = require('../models/category.model')
const pagination = require('../utils/pagination')

router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  res.redirect('/dashboard')
})

router.get('/add', async function (req, res) {
  parentCategory = await categoryModel.loadParent()
  res.render('vwCategory/_add',{parentCategory});
})

router.post('/add', async function (req, res) {
  if (req.body.parent==0)
    delete req.body.parent
  await categoryModel.add(req.body)
  res.redirect('back')
})

router.get('/list', async function (req, res) {
  const [[page,pv,nv],_,categoryList] = await pagination(req.query.page,categoryModel.count,
    (offset) => categoryModel.loadByPage(offset)
  )
  
  res.render('vwCategory/_list',{
    categoryList,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})


router.get('/edit/:id', async function (req, res,next) {
  const id = req.params.id
  const [parentCategory, categoryDataResult] = await Promise.all([categoryModel.loadParent(),categoryModel.loadById(id)])
  if (categoryDataResult.length===0)
    return next()
  categoryData=categoryDataResult[0]
  res.render('vwCategory/_edit',{categoryData,parentCategory})
})

router.post('/edit/:id', async function (req, res) {
  const id = req.params.id
  await categoryModel.patch(req.body,id)
  res.redirect('back');
})

router.post('/delete', async function (req, res) {
  await categoryModel.del(req.body.id)
  res.redirect('back')
})

module.exports = router