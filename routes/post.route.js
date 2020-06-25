const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const commentModel = require('../models/comment.model');


router.get('/:id', async function (req, res) {
  const id = req.params.id
  const cmtrows = await commentModel.load(id)

  res.render('vwPost/detail',{
      cmtrows
  })
})

router.post('/:id',async function(req,res){
    const uid = 1
    const pid = req.params.id
    await commentModel.add(uid,pid,req.body.content)
    res.redirect('back')
})

module.exports = router