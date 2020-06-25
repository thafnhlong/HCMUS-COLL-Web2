const db = require('../utils/db');

const TBL_POST = 'post';
const TBL_ACCOUNT = 'account';
const TBL_CATEGORY = 'category';
const TBL_POST_TAG = 'post_tag';
const TBL_TAG = 'tag';
const TBL_COMMENT = 'comment';

module.exports = {
  singleDetail: (pid)=>{
    return 1
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
  
  getByCat: (cid) => {
    return db.load(`
select p.id, p.title, p.abstract, p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
    left join ${TBL_POST_TAG} pt on p.id=pt.pid left join ${TBL_TAG} t on pt.tid = t.id
where c.id = ${cid}
group by p.id
    `)
  },
  
  searchFTS: (str) => {
    return db.load(`
select p.id, p.title, p.abstract, p.premium ,p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
    left join ${TBL_POST_TAG} pt on p.id=pt.pid left join ${TBL_TAG} t on pt.tid = t.id
where MATCH(p.title, p.content, p.abstract) AGAINST('${str}' IN NATURAL LANGUAGE MODE) 
group by p.id   
    `)
  }
};
