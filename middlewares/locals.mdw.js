const categoryModel = require('../models/category.model');
const accountModel = require('../models/account.model');
const cache = require('../utils/cache');
const moment = require('moment')

module.exports = function (app) {
  
  app.use(async function (req, res, next) {
    if (req.url.startsWith('/dashboard') || 
      req.url.startsWith('/account'))
      return next()
    
    const Category_List = 'categoryList'
    var data = cache.get(Category_List);
    let i = 0;
    if (!data) {
      data = await categoryModel.all()
      for (var index in data) {
        if (++i <= 6)
          data[index].show = true
      }
      cache.set(Category_List,data);
    }
    
    res.locals.categoryList = data
    
    next()
  })
  
  app.use(async function (req, res, next) {
    
    const loginUser = req.session.user
    if (loginUser){
      if (loginUser.cacheExpired === undefined)
        loginUser.cacheExpired = moment().add(1, 'm').toDate()
      else if (new Date(loginUser.cacheExpired) < new Date())
        req.session.user = await accountModel.singleByEmail(loginUser.email)
      
      const curUser = req.session.user
      if (moment(curUser.expired)> moment())
        curUser.premium = true
      
      res.locals.user = curUser
    }
    next()
  })
}
