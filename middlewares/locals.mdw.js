const categoryModel = require('../models/category.model');
const cache = require('../utils/cache');

module.exports = function (app) {
  
  app.use(async function (req, res, next) {
    if (req.url.startsWith('/dashboard'))
      return next()
    
    const Category_List = 'categoryList'
    var data = cache.get(Category_List);
    let i = 0;
    if (!data) {
      data = []
      const rows = await categoryModel.all()
      rows.forEach(x=>{
        if (x.parent){
          parentId = x.parent
          delete x.parent
          if (data[parentId] === undefined)
            data[parentId] = {group:[]}
          data[parentId].group.push(x)
          return
        }
        if (data[x.id] === undefined)
          data[x.id]={name:x.name,group:[]}
        else
          data[x.id].name = x.name
        if (++i <= 6)
          data[x.id].show = true
        cache.set(Category_List,data);
      })
    }
    
    res.locals.categoryList = data
    
    next()
  })
  
}
