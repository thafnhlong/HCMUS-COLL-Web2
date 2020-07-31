const db = require('../utils/db');

const config = require('../config/default.json')
const moment = require('moment')

const TBL_POST = 'post';
const TBL_ACCOUNT = 'account';
const TBL_CATEGORY = 'category';
const TBL_POST_TAG = 'post_tag';
const TBL_TAG = 'tag';
const TBL_COMMENT = 'comment';
const TBL_MANAGE = 'manage';

module.exports = {
  count : () => db.load(`select count(id) count from ${TBL_POST}`),
  loadByPage: (offset)=>{
    return db.load(`select id,title,premium,status from ${TBL_POST} limit ${config.pagination} offset ${offset}`)
  }
  ,
  countWith : (status,writeby) => db.load(`select count(id) count from ${TBL_POST} where status=${status} and writeby=${writeby}`),
  loadByPageWith: (status,writeby,offset)=>{
    return db.load(`select id,title,premium,status,postdate,reason from ${TBL_POST} where status=${status} and writeby=${writeby} limit ${config.pagination} offset ${offset}`)
  }
  ,
  countWithEditor : (uid) => {
    return db.load(`select count(p.id) count
from ${TBL_POST} p
where p.status=1 and p.cid in (
select c2.id
from ${TBL_MANAGE} m join ${TBL_CATEGORY} c on m.cid = c.id left join ${TBL_CATEGORY} c2 on (c.id = c2.parent or c.id = c2.id)
where m.uid=${uid}
)
    `)
  },
  loadByPageWithEditor: (uid,offset)=>{
    return db.load(`select p.id,p.title,p.premium,a.pseudonym uname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
where p.status=1 and p.cid in (
select c2.id
from ${TBL_MANAGE} m join ${TBL_CATEGORY} c on m.cid = c.id left join ${TBL_CATEGORY} c2 on (c.id = c2.parent or c.id = c2.id)
where m.uid=${uid}
)
limit ${config.pagination} offset ${offset}
    `)
  }
  ,
  loadById: (id) => {
    return db.load(`select p.*,a.pseudonym uname, GROUP_CONCAT(pt.tid) tids from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id left join ${TBL_POST_TAG} pt on p.id=pt.pid where p.id=${id} group by p.id`)
  },
  publish: function (id) {
    const entity = {
      status:2,
      postdate: new Date()
    }
    return this.patch(entity,id)
  },
  decline: function (id,reason) {
    const entity = {
      status:0,
      reason
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
  },
  getRandomByCategoryOfPost: (pid) => {
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.title, p.premium, p.postdate, p.views, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p
    join ${TBL_ACCOUNT} a on p.writeby = a.id 
    left join ${TBL_CATEGORY} c on p.cid=c.id
where p.status=2 and p.postdate <= ${now} and p.id != ${pid} and p.cid in 

(select c2.id
from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} c2 on (c.id = c2.parent or c.id=c2.id) 
    left join ${TBL_POST} p on p.cid=c.id
where p.id=${pid}
)
order by rand()
limit 5
    `)
  }
  ,
  mostOutstanding: ()=> {  
    const now = db.escape(new Date())
    const startWeek = db.escape(moment().startOf('isoWeek').toDate())
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
where p.status=2 and p.postdate BETWEEN ${startWeek} AND ${now} 
order by p.views desc
limit 4
    `)
  },
  mostViews: ()=>{
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
where p.postdate <= ${now} and p.status=2
order by p.views desc
limit 10
    `)
  },
  newest: ()=> {
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
where p.postdate <= ${now} and p.status=2
order by p.postdate desc
limit 10
    `)
  },
  newestEachCat: ()=>{
    const now = db.escape(new Date())
    return db.load(`
select p.id, p.premium, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id 
    join (
select max(p.id) id
from ${TBL_POST} p join
(
select max(postdate) postdate,cid
    from ${TBL_POST}
    where status=2 and postdate <= ${now}
    group by cid
    limit 10
) pc on (p.postdate = pc.postdate and p.cid = pc.cid)
group by p.cid
      
      ) pc on p.id=pc.id
      
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
where p.status=2 and p.postdate <= ${now} and p.cid in 

(select c2.id
from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} c2 on c.id = c2.parent
where c.id=${cid} UNION select ${cid})

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
where p.status=2 and p.postdate <= ${now} and p.cid in 

(select c2.id
from ${TBL_CATEGORY} c left join ${TBL_CATEGORY} c2 on c.id = c2.parent
where c.id=${cid} UNION select ${cid})
    `)
  }
  ,
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
  }
  ,
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
