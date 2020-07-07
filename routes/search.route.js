const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');
const pagination = require('../utils/pagination')

router.get('/:keyword/:page', async function (req, res) { 
  const keyword = req.params.keyword
  let [[page,pv,nv],[postCount],rows] = await pagination(req.params.page,
    ()=> postModel.searchFTSCount(keyword),
    (offset) => postModel.searchFTS(keyword,offset)
  )
  postCount = postCount.count
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

  data = {
    title: `${keyword} - Tìm kiếm`,
    header: `Tìm kiếm: ${keyword}`,
    list: rows,
    count: postCount,
    keyword
  }
  res.render('list',{
    data,
    page,
    pag: pv || nv,
    prev: {isValid:pv,page: page-1},
    next: {isValid:nv,page: page+1},
  });
})
router.get('/', function (req, res, next) {
  if (req.query.keyword)
    return res.redirect(`/search/${req.query.keyword}/1`)
  
  next()
})

module.exports = router