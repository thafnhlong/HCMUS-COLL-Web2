const db = require('../utils/db');

const config = require('../config/default.json')

const TBL_POST = 'post';
const TBL_ACCOUNT = 'account';
const TBL_CATEGORY = 'category';
const TBL_POST_TAG = 'post_tag';
const TBL_TAG = 'tag';
const TBL_COMMENT = 'comment';

module.exports = {
  count : () => db.load(`select count(*) count from ${TBL_POST}`),
  loadByPage: (offset)=>{
    return db.load(`select * from ${TBL_POST} limit ${config.pagination} offset ${offset}`)
  },
  countWith : (status,writeby) => db.load(`select count(*) count from ${TBL_POST} where status=${status} and writeby=${writeby}`),
  loadByPageWith: (status,writeby,offset)=>{
    return db.load(`select * from ${TBL_POST} where status=${status} and writeby=${writeby} limit ${config.pagination} offset ${offset}`)
  },
  loadById: (id) => {
    return db.load(`select p.*, GROUP_CONCAT(pt.tid) tids from ${TBL_POST} p left join ${TBL_POST_TAG} pt on p.id=pt.pid where id=${id}`)
  },
  publish: function (id) {
    const entity = {
      status:2,
      postdate: new Date()
    }
    return this.patch(entity,id)
  },
  increase: (id)=>db.load(`update ${TBL_POST} set views=views+1 where id=${id}`),
  add: (entity) => {
    return db.add(TBL_POST,entity)
  },
  patch: (entity,id) => {
    return db.patch(TBL_POST,entity,{id})
  },
  del: (id) => db.del(TBL_POST,{id}),
  setTag: async (entity) => {
    await db.del(TBL_POST_TAG,{pid:entity[0][0][0]})
    return db.addMultiple(TBL_POST_TAG+'(pid,tid)',entity)
  },
  singleDetail: (pid)=>{
    const now = db.escape(new Date())
    return db.load(`
select p.title, p.content, p.premium ,p.postdate, p.views, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
    left join ${TBL_POST_TAG} pt on p.id=pt.pid left join ${TBL_TAG} t on pt.tid = t.id 
where p.id = ${pid} and p.status=2 and postdate <= ${now}
group by p.id
    `)
  }
  ,
  mostOutstanding: ()=> {     
    return db.load(`select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
JOIN (select p.id
from ${TBL_POST} p left join ${TBL_COMMENT} c on p.id = c.pid
where (p.postdate BETWEEN DATE_SUB(now(),INTERVAL 1 WEEK) AND now() )
group by p.id
order by count(c.pid) desc
limit 4 ) v2 on v2.id = p.id`)
  },
  mostViews: ()=>{
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
order by p.views desc
limit 10
    `)
  },
  newest: ()=> {
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
order by p.postdate desc
limit 10
    `)
  },
  newestEachCat: ()=>{
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id JOIN 
(select p.id
from ${TBL_POST} p left join ${TBL_POST} _p on (p.cid = _p.cid and p.postdate < _p.postdate)
where _p.id is null) p2 on p2.id=p.id
order by p.postdate desc
limit 10
    `)
  },
  
  getByCat: (cid,offset) => {
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.title, p.abstract, p.premium, p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p left join ${TBL_POST_TAG} pt on p.id=pt.pid
    join ${TBL_ACCOUNT} a on p.writeby = a.id 
    left join ${TBL_CATEGORY} c on p.cid=c.id
    left join ${TBL_TAG} t on pt.tid = t.id
where p.status=2 and p.postdate <= ${now} and p.id in 

(select distinct p.id
from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} c2 on c.id = c2.parent
    join ${TBL_POST} p on (p.cid = c.id or p.cid=c2.id)
where c.id=${cid})

group by p.id
order by p.premium desc, p.postdate desc
limit ${config.pagination} offset ${offset}
    `)
  },
  
  getByCatCount: (cid) => {
    const now = db.escape(new Date())
    return db.load(`
select count(p.id) count
from ${TBL_POST} p
where p.status=2 and p.postdate <= ${now} and p.id in 

(select distinct p.id
from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} c2 on c.id = c2.parent
    join ${TBL_POST} p on (p.cid = c.id or p.cid=c2.id)
where c.id=${cid})
    `)
  },
  
  getByTag: (tid,offset) => {
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.title, p.abstract, p.premium, p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p left join ${TBL_POST_TAG} pt on p.id=pt.pid
    join ${TBL_ACCOUNT} a on p.writeby = a.id 
    left join ${TBL_CATEGORY} c on p.cid=c.id
    left join ${TBL_TAG} t on pt.tid = t.id
where p.status=2 and p.postdate <= ${now} and p.id in 

(select pt.pid
from ${TBL_TAG} t left join ${TBL_POST_TAG} pt on t.id=pt.tid
where t.id=${tid})

group by p.id
order by p.premium desc, p.postdate desc
limit ${config.pagination} offset ${offset}
    `)
  },
  
  getByTagCount: (tid) => {
    const now = db.escape(new Date())
    return db.load(`
select count(p.id) count
from ${TBL_POST} p
where p.status=2 and p.postdate <= ${now} and p.id in 

(select pt.pid
from ${TBL_TAG} t left join ${TBL_POST_TAG} pt on t.id=pt.tid
where t.id=${tid})
    `)
  },
  
  searchFTS: (str,offset) => {
    const now = db.escape(new Date())
    str = db.escape(str)
    return db.load(`
select p.id, p.title, p.abstract, p.premium, p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p left join ${TBL_POST_TAG} pt on p.id=pt.pid
    join ${TBL_ACCOUNT} a on p.writeby = a.id 
    left join ${TBL_CATEGORY} c on p.cid=c.id
    left join ${TBL_TAG} t on pt.tid = t.id
where p.status=2 and p.postdate <= ${now} and 

MATCH(p.title, p.content, p.abstract) AGAINST(${str} IN NATURAL LANGUAGE MODE) 

group by p.id
order by p.premium desc, p.postdate desc
limit ${config.pagination} offset ${offset}
    `)
  },
  
  searchFTSCount: (str) => {
    const now = db.escape(new Date())
    str = db.escape(str)
    return db.load(`
select count(p.id) count
from ${TBL_POST} p
where p.status=2 and p.postdate <= ${now} and 

MATCH(p.title, p.content, p.abstract) AGAINST(${str} IN NATURAL LANGUAGE MODE) 
    `)
  },
  
};
