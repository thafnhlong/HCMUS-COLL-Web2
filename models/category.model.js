const db = require('../utils/db');
const config = require('../config/default.json')

const TBL_CATEGORY = 'category';
const TBL_MANAGE = 'manage';

const formatCategoryList = object =>{
  let data = []
  object.forEach(xori=>{
    const x= Object.assign({}, xori)
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
  })
  return data
}

module.exports = {
  all: async ()=>{
    const rows = await db.load(`select * from ${TBL_CATEGORY}`)
    const data = formatCategoryList(rows)
    return [data,rows]
  },
  getByEditor: (uid) => db.load(`select cid from ${TBL_MANAGE} where uid=${uid}`),
  setForEditor: async (entity) => {
    await db.del(TBL_MANAGE,{uid:entity[0][0][0]})
    if (entity[0][0][1])
      return db.addMultiple(TBL_MANAGE+'(uid,cid)',entity)
    return true
  },
  add: (entity)=>{
    return db.add(TBL_CATEGORY,entity)
  },
  del: (id)=>{
    return db.del(TBL_CATEGORY,{id})
  },
  patch: (entity,id)=>{
    return db.patch(TBL_CATEGORY,entity,{id})
  },
  loadParent: () => {
    return db.load(`select * from ${TBL_CATEGORY} where parent is null`)
  },
  loadById: (id) => {
    return db.load(`select * from ${TBL_CATEGORY} where id=${id}`)
  },
  loadByPage: (offset)=>{
    return db.load(`select c.*,cp.name pname from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} cp on c.parent = cp.id limit ${config.pagination} offset ${offset}`)
  },
  count: ()=>{
    return db.load(`select count(*) count from ${TBL_CATEGORY}`)
  },
  loadByEditor: async (uid) => {
    const rows = await db.load(`select c2.* from ${TBL_MANAGE} m join ${TBL_CATEGORY} c on m.cid = c.id left join ${TBL_CATEGORY} c2 on 
    (c.id = c2.id or c.id = c2.parent) where uid=${uid}`)
    const data = formatCategoryList(rows)
    return [data,rows]
  },
};
