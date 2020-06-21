const LRU = require('lru-cache');
const categoryModel = require('../models/category.model');
const postModel = require('../models/post.model');

const cache = new LRU({
  max: 500,
  maxAge: 1000 * 60
})

/*
mostOutstanding.forEach(x=>{
tagIdlist=x.tids.split(',')
tagNamelist= x.tnames.split(',')
x.tag = tagIdlist.map((x,i)=> {
  return {id: x,name: tagNamelist[i]}
})
})
*/

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
  
  app.use('/', async function (req, res, next) {
    if (req.url == '/') {
      const Home_List = 'homePostList'
      var data = cache.get(Home_List);
      if (!data) {
        const mostOutstanding = await postModel.mostOutstanding()        
        data= {mostOutstanding}      
        cache.set(Home_List,data);
      }
      res.locals.homePostList = data
    }
    next()
  })

  
}
