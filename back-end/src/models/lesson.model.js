const db = require('./db')();
const UUID = require('uuid');
const { errorHandle } = require('../services/errorHandle');

async function createLessons(tenantID, lessons) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    if(!tenantID || !lessons) errorHandle('BAD_REQUEST', 400);
    if(!Array.isArray(lessons) || lessons.length === 0) errorHandle('BAD_REQUEST', 400);

    try {
        for (const lesson of lessons) {
            const lessonID = UUID.v4();
            const [exist] = await connection.query(
                'SELECT 1 FROM LESSONS WHERE TENANT_ID = ? AND (LESSON_NAME = ? OR LESSON_NAME_EN = ?)', 
                [tenantID, lesson.lesson_name, lesson.lesson_name_en]
            );
            if(exist.length > 0) { 
                await connection.rollback();
                errorHandle('DUPLICATE', 409);
            }
            const query = 'INSERT INTO LESSONS (TENANT_ID, LESSON_ID, TEACHER_ID, LESSON_NAME, LESSON_NAME_EN, GRADE) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [tenantID, lessonID, lesson.teacher_id, lesson.lesson_name, lesson.lesson_name_en, lesson.grade];
            const [result] = await connection.query(query, values);
            if(result.affectedRows === 0){
                await connection.rollback();
                errorHandle('FAILED', 500);
            }
        }
        await connection.commit();
        return { success: true, status: 201 };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getLessons(tenantID) {
    const connection = await db.getConnection();
    if(!tenantID) errorHandle('BAD_REQUEST', 400);

    try {
        const lessons = await connection.query('SELECT * FROM LESSONS WHERE TENANT_ID = ?', [tenantID]);
        return { success: true, data: lessons[0], status: 200 };
    }catch(error){
        throw error;
    }finally{
        connection.release();
    }
}

async function getLesson(tenantID, lessonID){
    const connection = await db.getConnection();
    if(!tenantID || !lessonID) errorHandle('BAD_REQUEST', 400);
    
    try {
        const lesson = await connection.query('SELECT * FROM LESSONS WHERE TENANT_ID = ? AND LESSON_ID = ?', [tenantID, lessonID]); 
        if(lesson[0].length === 0) errorHandle('NOT_FOUND', 404);
        else return { success: true, data: lesson[0], status: 200 };
    }catch(error){
        throw error;
    }finally{
        connection.release();
    }
}

async function patchLesson(tenantID, lessonID, lessonName, lessonNameEn, grade) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    if (!tenantID || !lessonID) errorHandle('BAD_REQUEST', 400);

    try {
        const [exist] = await connection.query(
            'SELECT * FROM LESSONS WHERE TENANT_ID = ? AND LESSON_ID = ?',
            [tenantID, lessonID]
        );
        if (exist.length === 0) {
            await connection.rollback();
            errorHandle('NOT_FOUND', 404);
        }

        const query = `
            UPDATE LESSONS
            SET LESSON_NAME = ?, LESSON_NAME_EN = ?, GRADE = ?
            WHERE TENANT_ID = ? AND LESSON_ID = ?
        `;
        const values = [lessonName, lessonNameEn, grade, tenantID, lessonID];
        const [result] = await connection.query(query, values);
        if (result.affectedRows === 0) {
            await connection.rollback();
            errorHandle('FAILED', 500);
        }

        await connection.commit();
        return { success: true, status: 200 };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteLesson(tenantID, lessonID) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    if (!tenantID || !lessonID) errorHandle('BAD_REQUEST', 400);

    try {
        const [exist] = await connection.query(
            'SELECT * FROM LESSONS WHERE TENANT_ID = ? AND LESSON_ID = ?',
            [tenantID, lessonID]
        );
        if (exist.length === 0) {
            await connection.rollback();
            errorHandle('NOT_FOUND', 404);
        }

        const query = 'DELETE FROM LESSONS WHERE TENANT_ID = ? AND LESSON_ID = ?';
        const values = [tenantID, lessonID];
        const [result] = await connection.query(query, values);
        if (result.affectedRows === 0) {
            await connection.rollback();
            errorHandle('FAILED', 500);
        }

        await connection.commit();
        return { success: true, status: 200 };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    createLessons,
    getLessons,
    getLesson,
    patchLesson,
    deleteLesson
}