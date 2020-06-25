const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');


router.get('/:keyword/:page', async function (req, res) {
  
  const keyword = req.params.keyword
  
  var rows = await postModel.searchFTS(keyword)
  
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
    count: rows.length,
    keyword
  }
  res.render('list',{data});
})
router.get('/', function (req, res, next) {
  if (req.query.keyword)
    return res.redirect(`/search/${req.query.keyword}/1`)
  
  next()
})

module.exports = router