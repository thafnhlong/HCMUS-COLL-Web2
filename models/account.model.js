const db = require('../utils/db');
const TBL_account = 'account';
const config = require('../config/default.json')
const moment = require('moment')
module.exports = {
    add: function (entity) {
        return db.add(TBL_account, entity);
    },
    getByPermisson: (type) => {
        return db.load(`select * from ${TBL_account} where permisson=${type}`)
    },
    singleByEmail: async function (email) {
        const rows = await db.load(`select * from ${TBL_account} where email = '${email}'`);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    singleByCode: async function (code) {
        const now = new Date();
        const rows = await db.load(`select * from ${TBL_account} where verifycode = '${code}' and expiredcode>=${db.escape(now)}`);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    patch: function (entity) {
        const condition = {
            id: entity.id
        }
        delete entity.id
        return db.patch(TBL_account, entity, condition);
    },
    loadByPage: (offset) => {
        return db.load(`select * from ${TBL_account} limit ${config.pagination} offset ${offset}`)
    },
    count: () => {
        return db.load(`select count(*) count from ${TBL_account}`)
    },
    extend: (entity) => {
        const condition = {
            id: entity.id,
            expired: moment(entity.expired, "DD-MM-YYYY").add(5, 'days')
        }
        delete entity.id
        return db.patch(TBL_account, entity, condition);
    },
    del: (id) => {
        return db.del(TBL_account, { id })
    },
}