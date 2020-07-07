const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const tagModel = require('../models/tag.model');
const pagination = require('../utils/pagination')


router.get('/:id/:page', async function (req, res, next) {  
  const id = req.params.id
  let [[page,pv,nv],[_,currentTag],rows] = await pagination(req.params.page,
    () => Promise.all([
      postModel.getByTagCount(id),
      tagModel.loadById(id)
    ]),
    (offset) => postModel.getByTag(id,offset)
  )
 
  if (currentTag.length===0)
    return next()  
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

  const tagName = currentTag[0].name 
  data = {
    title: `${tagName}`,
    header: `Nhãn: ${tagName}`,
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
    return res.redirect(`/tag/${req.params.id}/1`)
  
  next()
})

module.exports = router