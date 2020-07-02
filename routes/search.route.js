const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');
const config = require('../config/default.json')

router.get('/:keyword/:page', async function (req, res) {
  let page = 1
  
  const keyword = req.params.keyword
  
  let postCount = await postModel.searchFTSCount(keyword)
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
  
  const rows = await postModel.searchFTS(keyword,(page-1)*config.pagination)
  
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