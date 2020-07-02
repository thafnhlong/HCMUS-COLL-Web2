const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');
const config = require('../config/default.json')


router.get('/:id/:page', async function (req, res, next) {
  let page = 1
  
  const id = req.params.id
  
  const Category_List = 'categoryList'
  var data = cache.get(Category_List)[1];
  const currentCategory = data.find(x=>x.id==id)
  if (!currentCategory)
    return next()

  let postCount = await postModel.getByCatCount(id)
  postCount=postCount[0].count
  const maxPage = Math.ceil(+postCount / config.pagination)
  if (req.params.page)
    page = +req.params.page
  if (page > maxPage)
    page = +maxPage
  if (page < 1)
    page = 1 
  const pv = page > 1
  const nv = page < maxPage 
  
  const rows = await postModel.getByCat(id,(page-1)*config.pagination)
  
  rows.forEach(x=>{
    if (x.tids === null) {
      x.tag = []
      return
    }
    tagIdlist=x.tids.split(',')
    tagNamelist= x.tnames.split(',')
    x.tag = tagIdlist.map((x,i)=> {
      return {id: x,name: tagNamelist[i]}
    })
  })

  const catName = currentCategory.name 
  data = {
    title: `${catName}`,
    header: `Chuyên mục: ${catName}`,
    list: rows,
  }
  res.render('list',{
    data,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})
router.get('/:id', function (req, res, next) {
  if (req.params.id)
    return res.redirect(`/category/${req.params.id}/1`)
  
  next()
})

module.exports = router