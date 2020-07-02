const express = require('express');
const router = express.Router();

router.use(async function (req, res, next) {
  if (!res.locals.user)
    return res.redirect('/account')
  
  res.locals.layout = '_main'
  next()
})

router.get('/',(req,res) => {
  res.redirect('/dashboard/profile/edit')
})

router.get('/:type/:option*',(req,res,next) => {
  res.locals.navOption = {
    type: req.params.type,
    option: req.params.option
  }
  next()
})


router.use('/profile',require('./_profile.route'))
//writer

//editor

//admin
router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  return res.redirect('/dashboard')
})
router.use('/category',require('./_category.route'))
router.use('/tag',require('./_tag.route'))
router.use('/post',require('./_post.route').admin_router)
router.use('/account',require('./_account.route'))

router.use(function (req, res) {
  res.status(404).send('404 not found');
})

router.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('500 error found');
})

module.exports = router;