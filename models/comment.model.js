const db = require('../utils/db');
const moment = require('moment')

const TBL_POST = 'post';
const TBL_ACCOUNT = 'account';
const TBL_COMMENT = 'comment';

module.exports = {
    add :async (uid,pid,content)=>{
        return db.add(TBL_COMMENT,{
            uid,pid,content,time: new Date()
        })
    },
    load: async(pid)=>{
        return db.load(`
        select c.content, c.time, a.name
        from comment c join account a on c.uid = a.id
        where c.pid =${pid}`)
    }
}