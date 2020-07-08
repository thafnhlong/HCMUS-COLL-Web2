const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const commentModel = require('../models/comment.model');


router.get('/:id', async function (req, res, next) {
  const id = req.params.id

  const [_,detail,cmtrows,relatedPost] = await Promise.all([
    postModel.increase(id),
    postModel.singleDetail(id),
    commentModel.load(id),
    postModel.getRandomByCategoryOfPost(id)
  ])
  
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
      relatedPost,
      cmtrows,
      cmtrowslenght: cmtrows.length
  })
})

router.post('/:id',async function(req,res,next){
    if (!res.locals.user)
      return next()
    const uid = res.locals.user.id
    const pid = req.params.id
    await commentModel.add(uid,pid,req.body.content)
    
    backURL=req.header('Referer') || '/';
    res.redirect(backURL+'#news')
})

module.exports = router