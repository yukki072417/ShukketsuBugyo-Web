const db = require('../models/db')();
const { errorHandle } = require('../services/errorHandle');
const UUID = require('uuid');

async function createCourse(tenantID, bodys) {

    if(!Array.isArray(bodys) || !tenantID) errorHandle('BAD_REQUEST', 400);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        for(const body of bodys){
            
            const { course_name: courseName, course_name_en: courseNameEN } = body;
            const exist = await connection.query('SELECT * FROM COURSES WHERE TENANT_ID = ? AND (COURSE_NAME = ? OR COURSE_NAME_EN = ?)', [tenantID, courseName, courseNameEN]);
            if(exist[0].length > 0) errorHandle('DUPLICATE', 409);

            const courseID = UUID.v4();
            if(!courseID || !courseName || !courseNameEN) errorHandle('BAD_REQUEST', 400);

            const sql = 'INSERT INTO COURSES (TENANT_ID, COURSE_ID, COURSE_NAME, COURSE_NAME_EN) VALUES (?, ?, ?, ?)';
            const values = [tenantID, courseID, courseName, courseNameEN];
            const result = await connection.query(sql, values);

            if(result[0].affectedRows === 0 ) errorHandle('SERVER ERROR', 500);
        }

        await connection.commit();
        return {result: 'SUCCESS', status: 207};
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

}

async function getCourseByName(tenantID, courseName, courseNameEN) {
    if(!tenantID || (!courseName && !courseNameEN)) errorHandle('BAD_REQUEST', 400);

    const selectionMode = courseName ? 'COURSE_NAME' : 'COURSE_NAME_EN';
    const selectionModeValue = courseName ? courseName : courseNameEN;

    try {
        
    if(selectionMode === 'COURSE_NAME') {
        const sql = 'SELECT * FROM COURSES WHERE TENANT_ID = ? AND COURSE_NAME = ?';
        const values = [tenantID, courseName];
        const result = await db.query(sql, values);

        if(result[0].length === 0) errorHandle('NOT_FOUND', 404);
        return {result: 'SUCCESS', data: result[0], status: 200};
    } else {
        const sql = 'SELECT * FROM COURSES WHERE TENANT_ID = ? AND COURSE_NAME_EN = ?';
        const values = [tenantID, courseNameEN];
        const result = await db.query(sql, values);

        if(result[0].length === 0) errorHandle('NOT_FOUND', 404);
        return {result: 'SUCCESS', data: result[0], status: 200};
    }
    } catch (error) {
        throw error;
    }

}

async function getCourses(tenantID) {
    if(!tenantID) errorHandle('BAD_REQUEST', 400);

    const connection = await db.getConnection();

    try {

        const sql = 'SELECT * FROM COURSES WHERE TENANT_ID = ?';
        const values = [tenantID];
        const result = await connection.query(sql, values);

        if(result[0].length === 0) errorHandle('NOT_FOUND', 200);
        return {result: 'SUCCESS', data: result[0], status: 200};
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }

}

async function patchCourses(tenantID, bodys) {

    if(Array.isArray(bodys) === false || !tenantID) errorHandle('BAD_REQUEST', 400);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        for(const body of bodys){
            const { course_id: courseID, course_name: courseName, course_name_en: courseNameEN } = body;
            if(!courseID || !courseName || !courseNameEN) errorHandle('BAD_REQUEST', 400);

            const sql = 'UPDATE COURSES SET COURSE_NAME = ?, COURSE_NAME_EN = ? WHERE TENANT_ID = ? AND COURSE_ID = ?';
            const values = [courseName, courseNameEN, tenantID, courseID];
            const result = await connection.query(sql, values);

            if(result[0].affectedRows === 0 ) errorHandle('SERVER ERROR', 500);
        }
        
        await connection.commit();
        return {result: 'SUCCESS', status: 200};
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteCourse(tenantID, courseID) {
    if(!tenantID || !courseID) errorHandle('BAD_REQUEST', 400);
    const connection = await db.getConnection();

    try {        
        await connection.beginTransaction();

        const query = 'DELETE FROM COURSES WHERE TENANT_ID = ? AND COURSE_ID = ?';
        const values = [tenantID, courseID];
        const result = await connection.query(query, values);

        if(result[0].affectedRows === 0 ) errorHandle('SERVER ERROR', 500);

        await connection.commit();
        return { success: true, data: result[1], status: 200 }
    } catch (error) {
        connection.rollback();
    } finally {
        connection.release();
    }
}

module.exports = {
    createCourse,
    getCourses,
    getCourseByName,
    patchCourses,
    deleteCourse
}