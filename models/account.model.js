const db = require('../utils/db');
const TBL_account = 'account';

module.exports = {
    add: function (entity) {
        return db.add(TBL_account, entity);
    },
    singleByEmail: async function (email) {
        const rows = await db.load(`select * from ${TBL_account} where email = '${email}'`);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    singleByCode: async function (code) {
        const now=new Date();
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
}