const db = require('../utils/db');
const config = require('../config/default.json')

const TBL_CATEGORY = 'category';

module.exports = {
  all: function () {
    return db.load(`select * from ${TBL_CATEGORY}`);
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
  }
};
