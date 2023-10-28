const express = require('express');
const router = express.Router();
const { db, genid } = require('../db/DBUtils')

// 查询博客
router.get('/search', async (req, res) => {

    /**
     * keyword 关键字
     * categoryId 分类编号
     * 
     * 分页：
     * page 页码
     * pageSize 分页大小
     * 
     * 
     */
    let { keyword, categoryId, page, pageSize } = req.query;

    page = page == null ? 1 : page;
    pageSize = pageSize == null ? 10 : pageSize;
    categoryId = categoryId == null ? 0 : categoryId;
    keyword = keyword == null ? '' : keyword;

    let params = []
    let whereSqls = [];
    if (categoryId != 0) {
        whereSqls.push(" `category_id` = ? ")
        params.push(categoryId)
    }

    if (keyword != '') {
        whereSqls.push(" (`title` like ? or `content` like ?) ")
        params.push("%" + keyword + "%")
        params.push("%" + keyword + "%")
    }

    let whereSqlStr = '';
    if (whereSqls.length > 0) {
        whereSqlStr = " where " + whereSqls.join(" and ")
    }

    // 查分页数据
    let searchSql = " select * from `blog` " + whereSqlStr + " order by `create_time` desc limit ?,? ";
    let searchSqlParams = params.concat([(page - 1) * pageSize, pageSize]);

    // 查询数据总数
    let searchCountSql = " select count(*) as `count` from `blog` " + whereSqlStr;
    let searchCountParams = params;

    // 分页数据
    let searchResult = await db.async.all(searchSql, searchSqlParams);
    let countResult = await db.async.all(searchCountSql, searchCountParams);

    if (searchResult.err == null && countResult.err == null) {
        res.send({
            code: 200,
            msg: '查询成功',
            data: {
                keyword,
                categoryId,
                page,
                pageSize,
                rows: searchResult.rows,
                count: countResult.rows[0].count,
            }
        });
    } else {
        res.send({
            code: 500,
            msg: '查询失败',
        })
    }
});

// 添加博客
router.post('/_token/add', async (req, res) => {

    let { title, categoryId, content } = req.body;
    let id = genid.NextId();
    let create_time = new Date().getTime();

    const insert_sql = "insert into `blog` (`id`,`title`, `category_id`,`content`,`create_time`) values (?,?,?,?,?)"
    let params = [id, title, categoryId, content, create_time]

    let { err, rows } = await db.async.run(insert_sql, params)
    if (err == null) {
        res.send({
            code: 200,
            msg: '添加成功'
        })
    } else {
        res.send({
            code: 500,
            msg: '添加失败',
            err
        })
    }
})

// 修改博客
router.put('/_token/update', async (req, res) => {

    let { id, title, categoryId, content } = req.body;
    let create_time = new Date().getTime();

    const update_sql = "update `blog` set `title`=?,`category_id`=?,`content`=? where `id` = ?"
    let params = [title, categoryId, content, id]

    let { err, rows } = await db.async.run(update_sql, params)
    if (err == null) {
        res.send({
            code: 200,
            msg: '添加成功'
        })
    } else {
        res.send({
            code: 500,
            msg: '添加失败'
        })
    }
})

// 删除博客
router.delete('/_token/delete', async (req, res) => {
    let id = req.query.id
    const delete_sql = "DELETE FROM `blog` WHERE `id` = ? "
    let { err, rows } = await db.async.run(delete_sql, [id])

    if (err == null) {
        res.send({
            code: 200,
            msg: '删除成功'
        })
    } else {
        res.send({
            code: 500,
            msg: '删除失败'
        })
    }
})

module.exports = router;