const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');
const pagination = require('../utils/pagination')


router.get('/:id/:page', async function (req, res, next) {
  const id = req.params.id
  
  const Category_List = 'categoryList'
  var data = cache.get(Category_List)[1];
  const currentCategory = data.find(x=>x.id==id)
  if (!currentCategory)
    return next()
  
  let [[page,pv,nv],_,rows] = await pagination(req.params.page,
    ()=> postModel.getByCatCount(id),
    (offset) => postModel.getByCat(id,offset)
  )
  
  if (page===0)
    rows=[]
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