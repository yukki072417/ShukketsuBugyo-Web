const db = require('./db')();
const { errorHandle } = require('../services/errorHandle');

async function createTimetable(tenantID, grade, className, period, lessonID, dayOfWeek) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const query = `
            INSERT INTO TIME_TABLE (TENANT_ID, LESSON_ID, PERIOD, DAY_OF_WEEK, GRADE, CLASS)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(query, [tenantID, lessonID, period, dayOfWeek, grade, className]);
        
        await connection.commit();
        return { status: 201, success: true };
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            errorHandle('CONFLICT', 409);
        }
        throw error;
    } finally {
        connection.release();
    }
}

async function createTimetableBatch(tenantID, timetableEntries) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 既存の時間割を削除
        const deleteQuery = `
            DELETE FROM TIME_TABLE 
            WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?
        `;
        
        if (timetableEntries.length > 0) {
            await connection.query(deleteQuery, [tenantID, timetableEntries[0].grade, timetableEntries[0].class]);
        }
        
        // 新しい時間割を一括挿入
        const insertQuery = `
            INSERT INTO TIME_TABLE (TENANT_ID, LESSON_ID, PERIOD, DAY_OF_WEEK, GRADE, CLASS)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        for (const entry of timetableEntries) {
            await connection.query(insertQuery, [
                tenantID, 
                entry.lesson_id, 
                entry.period, 
                entry.day_of_week, 
                entry.grade, 
                entry.class
            ]);
        }
        
        await connection.commit();
        return { status: 201, success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getTimetable(tenantID, grade, className) {
    try {
        const query = `
            SELECT 
                tt.DAY_OF_WEEK as day_of_week,
                tt.PERIOD as period,
                l.LESSON_NAME as lesson_name,
                l.LESSON_NAME_EN as lesson_name_en
            FROM TIME_TABLE tt
            JOIN LESSONS l ON tt.TENANT_ID = l.TENANT_ID AND tt.LESSON_ID = l.LESSON_ID
            WHERE tt.TENANT_ID = ? AND tt.GRADE = ? AND tt.CLASS = ?
            ORDER BY tt.DAY_OF_WEEK, tt.PERIOD
        `;
        
        const [rows] = await db.query(query, [tenantID, grade, className]);
        
        return { status: 200, data: rows };
    } catch (error) {
        throw error;
    }
}

async function updateTimetable(tenantID, grade, className, period, lessonID, dayOfWeek) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const query = `
            UPDATE TIME_TABLE 
            SET LESSON_ID = ?
            WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ? AND PERIOD = ? AND DAY_OF_WEEK = ?
        `;
        
        const [result] = await connection.query(query, [lessonID, tenantID, grade, className, period, dayOfWeek]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            errorHandle('NOT_FOUND', 404);
        }
        
        await connection.commit();
        return { status: 200, success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteTimetable(tenantID, grade, className, period, dayOfWeek) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const query = `
            DELETE FROM TIME_TABLE 
            WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ? AND PERIOD = ? AND DAY_OF_WEEK = ?
        `;
        
        const [result] = await connection.query(query, [tenantID, grade, className, period, dayOfWeek]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            errorHandle('NOT_FOUND', 404);
        }
        
        await connection.commit();
        return { status: 200, success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteTimetableByClass(tenantID, grade, className) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const query = `
            DELETE FROM TIME_TABLE 
            WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?
        `;
        
        await connection.query(query, [tenantID, grade, className]);
        
        await connection.commit();
        return { status: 200, success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    createTimetable,
    createTimetableBatch,
    getTimetable,
    updateTimetable,
    deleteTimetable,
    deleteTimetableByClass
};