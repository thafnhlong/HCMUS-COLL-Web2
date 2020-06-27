const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');


router.get('/:id/:page', async function (req, res, next) {
  
  const id = req.params.id
  
  var rows = await postModel.getByCat(id)
  if (rows.length ===0 )
    return next()
  const catName = rows[0].cname
  
  if (rows[0].id === null)
    rows=[]
  else{
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
  }
  
  data = {
    title: `${catName}`,
    header: `Chuyên mục: ${catName}`,
    list: rows,
  }
  res.render('list',{data});
})
router.get('/:id', function (req, res, next) {
  if (req.params.id)
    return res.redirect(`/category/${req.params.id}/1`)
  
  next()
})

module.exports = router