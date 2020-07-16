const express = require('express');
const accountmd = require('../models/account.model')
const router = express.Router();
const config = require('../config/default.json')
const pagination = require('../utils/pagination')
const categoryModel = require('../models/category.model')
const bcrypt = require('bcryptjs');
const moment = require('moment');

router.use(async function (req, res, next) {
  if (res.locals.user.permisson == 4)
    return next()
  res.redirect('/dashboard')
})

router.get('/add', function (req, res) {

  res.render('vwAccount/_add');
})


router.get('/list', async function (req, res) {
  const [[page,pv,nv],_,[accList,categoryList]] = await pagination(req.query.page,accountmd.count,
    (offset) => Promise.all([
      accountmd.loadByPage(offset),
      categoryModel.loadParent()
    ])
  )

  res.render('vwAccount/_list', {
    accList,
    categoryList,
    page,
    pag: pv || nv,
    prev: { isValid: pv, page: page - 1 },
    next: { isValid: nv, page: page + 1 },
  });
})

router.get('/manage',async (req,res,next)=>{
  if (!req.query.id)
    return next()
  res.json(await categoryModel.getByEditor(req.query.id))
})

router.post('/manage',async (req,res,next)=>{
  const id = req.body.id
  const cids = req.body.cids
  let entity = [[id]]
  if (Array.isArray(cids))
    entity = cids.map(x=>[id,x])
  else if (typeof cids === 'string')
    entity[0][1] = cids
  await categoryModel.setForEditor([entity])
  res.redirect('back')
})

router.get('/edit/:id',async function (req, res) {
  const account= await accountmd.singleByID(req.params.id);
  account.dob=moment(account.dob).format("DD/MM/YYYY");
  res.render('vwAccount/_edit',{account});
})

router.post('/extend', async function (req, res) {
  await accountmd.extend(req.body.id)
  res.redirect('back')
})

router.post('/delete', async function (req, res) {
  await accountmd.del(req.body.id)
  res.redirect('back')
})

router.post('/add', async function (req, res) {
  const account = {
    name: req.body.name,
    email: req.body.email,
    dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    permisson: req.body.permission,
  }
  const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
  account.password = password_hash

  if (req.body.permission == '1') {
    account.expired = moment().add(7,'days').toDate();
  }
  if (req.body.permission == '2') {
    account.pseudonym = req.body.pseudonym;
  }
  await accountmd.add(account);
  res.redirect('/dashboard/account/list')
})

router.get('/is-available', async function (req, res) {
  const user = await accountmd.singleByEmail(req.query.user);
  if (!user) {
    return res.json(true);
  }
  res.json(false);
})

router.post('/edit',async function (req, res) {
  const account = {
    id:req.body.id,
    name: req.body.name,
    email: req.body.email,
    dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    permisson: req.body.permission,
  }
  const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
  account.password = password_hash

  if (req.body.permission == '2') {
    account.pseudonym = req.body.pseudonym;
  }
  await accountmd.patch(account);
  res.redirect('/dashboard/account/list');
})

module.exports = router