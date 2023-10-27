const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid') // node uuid
const { db, genid } = require('../db/DBUtils')

router.post('/login', async (req, res) => {

    console.log('login..............');

    let { account, password } = req.body;
    let { err, rows } = await db.async.all("select * from `admin` where `account` = ? and `password` = ?", [account, password])

    if (err == null && rows.length > 0) {

        let login_token = uuidv4();
        let update_token_sql = 'update `admin` set `token` = ? where `id` = ?';
        let update_token_params = [login_token, rows[0].id];

        await db.async.run(update_token_sql, update_token_params);

        let admin_info = rows[0];
        admin_info.token = login_token;
        admin_info.password = "";

        res.send({
            code: 200,
            msg: '登录成功',
            data: admin_info
        })
    } else {
        res.send({
            code: 500,
            msg: '登录失败',
            err: err
        })
    }

})

module.exports = router;