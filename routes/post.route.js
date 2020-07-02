const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const commentModel = require('../models/comment.model');


router.get('/:id', async function (req, res, next) {
  const id = req.params.id

  const [detail,cmtrows] = await Promise.all([postModel.singleDetail(id),commentModel.load(id),postModel.increase(id)])
  
  const x = detail[0]
  if (x === undefined)
    return next()
  if (x.tids === null)
    x.tag = []
  else {
    const tagIdlist=x.tids.split(',')
    const tagNamelist= x.tnames.split(',')
    x.tag = tagIdlist.map((x,i)=> {
      return {id: x,name: tagNamelist[i]}
    })
  }
  
  res.render('vwPost/detail',{
      detail: x,
      cmtrows,
      cmtrowslenght: cmtrows.length
  })
})

router.post('/:id',async function(req,res){
    const uid = 1
    const pid = req.params.id
    await commentModel.add(uid,pid,req.body.content)
    
    backURL=req.header('Referer') || '/';
    res.redirect(backURL+'#news')
})

module.exports = router