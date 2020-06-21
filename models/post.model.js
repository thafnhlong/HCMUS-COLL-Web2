const db = require('../utils/db');

/*
    const sql = 
`select p.id, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname, GROUP_CONCAT(t.id) tids, GROUP_CONCAT(t.name) tnames
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
    left join ${TBL_POST_TAG} pt on p.id=pt.pid left join ${TBL_TAG} t on pt.tid = t.id
JOIN (select p.id
from ${TBL_POST} p left join ${TBL_COMMENT} c on p.id = c.pid
where (p.postdate BETWEEN DATE_SUB(now(),INTERVAL 1 WEEK) AND now() )
group by p.id
order by count(c.pid) desc
limit 4 ) v2 on v2.id = p.id`
*/

const TBL_POST = 'post';
const TBL_ACCOUNT = 'account';
const TBL_CATEGORY = 'category';
const TBL_POST_TAG = 'post_tag';
const TBL_TAG = 'tag';
const TBL_COMMENT = 'comment';

module.exports = {
  allWithDetail: function () {
    return db.load(``);
  },
  mostOutstanding: ()=> {    
    return db.load(`select p.id, p.title,p.views,p.postdate, a.pseudonym uname, c.id cid, c.name cname
from ${TBL_POST} p join ${TBL_ACCOUNT} a on p.writeby = a.id
    join ${TBL_CATEGORY} c on p.cid = c.id
JOIN (select p.id
from ${TBL_POST} p left join ${TBL_COMMENT} c on p.id = c.pid
where (p.postdate BETWEEN DATE_SUB(now(),INTERVAL 1 WEEK) AND now() )
group by p.id
order by count(c.pid) desc
limit 4 ) v2 on v2.id = p.id`)
  }
};
