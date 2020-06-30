const db = require('../utils/db');
const config = require('../config/default.json')

const TBL_TAG = 'tag';

module.exports = {
  add: (entity)=>{
    return db.add(TBL_TAG,entity)
  },
  del: (id)=>{
    return db.del(TBL_TAG,{id})
  },
  patch: (entity,id)=>{
    return db.patch(TBL_TAG,entity,{id})
  },
  loadById: (id) => {
    return db.load(`select * from ${TBL_TAG} where id=${id}`)
  },
  loadByPage: (offset)=>{
    return db.load(`select * from ${TBL_TAG} limit ${config.pagination} offset ${offset}`)
  },
  count: ()=>{
    return db.load(`select count(*) count from ${TBL_TAG}`)
  }
}