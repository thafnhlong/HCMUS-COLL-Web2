const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const cache = require('../utils/cache');

router.get('/', async function (req, res) {
  const Home_List = 'homePostList'
  var data = cache.get(Home_List);
  if (!data) {

    const [mostOutstanding,mostViews,newest,newestEachCat] = await Promise.all([
      postModel.mostOutstanding(),postModel.mostViews(),postModel.newest(),postModel.newestEachCat()
    ])            

    data= [
      ['NỔI BẬT NHẤT TUẦN QUA', mostOutstanding],
      ['XEM NHIỀU NHẤT', mostViews],
      ['BÀI MỚI NHẤT', newest],
      ['TOP CHUYÊN MỤC', newestEachCat]
    ]     
    cache.set(Home_List,data);
  }
  
  res.render('home',{homePostList:data});
})

module.exports = router