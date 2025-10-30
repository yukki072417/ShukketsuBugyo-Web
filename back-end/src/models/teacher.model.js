const db = require("./db")();
const tenantModel = require('./tenant.model');
const { errorHandle } = require('../services/errorHandle');

async function createTeacher(tenantID, teacherID, password, manager) {

    const connection = await db.getConnection();
    try {
        const existTenant = await tenantModel.getTenantByID(tenantID);
        const existTeacher = await getTeacherByID(tenantID, teacherID);

        if(existTenant.success === false && existTenant.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}
        if(existTeacher.success === true) return {success: false, message: 'DUPLICATE', status: 409}

        const query = 'INSERT INTO TEACHERS (TENANT_ID, TEACHER_ID, PASSWORD, MANAGER) VALUES (?, ?, ?, ?)'
        const values = [tenantID, teacherID, password, manager]
        const result = await connection.query(query, values);

        return { success: true, data: result[0] };
    } catch (error) {
        connection.rollback();
        throw error
    } finally {
        connection.release();
    }
}

async function getTeacherByID(tenantID, teacherID) {

    const connection = await db.getConnection();
    try {
        const existTenant = await tenantModel.getTenantByID(tenantID);
        if(existTenant.success === false && existTenant.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}
        
        const query = 'SELECT * FROM TEACHERS WHERE TENANT_ID = ? AND TEACHER_ID = ?'
        const values = [tenantID, teacherID]
        const results = await connection.query(query, values);
        if (results[0].length > 0) return { success: true, data: results[0] }
        else return { success: false, message: 'NOT_FOUND', status: 404 }
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getTeachers(tenantID) {

    const connection = await db.getConnection();
    try {
        const existTenant = await tenantModel.getTenantByID(tenantID);
        if(existTenant.success === false && existTenant.message === 'NOT_FOUND') errorHandle('NOT_FOUND', 404);

        const query = 'SELECT * FROM TEACHERS WHERE TENANT_ID = ?'
        const values = [tenantID]
        const results = await connection.query(query, values);
        return { success: true, data: results[0] }
    }catch(error){
        connection.rollback();
        throw error
    } finally {
        connection.release();
    }
}

async function updateTeacher(tenantID, teacherID, password, manager) {
    const connection = await db.getConnection();
    try {
        const existTenant = await tenantModel.getTenantByID(tenantID);
        const existTeacher = await getTeacherByID(tenantID, teacherID);

        if(existTenant.success === false && existTenant.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}
        if(existTeacher.success === false && existTeacher.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}

        let query = 'UPDATE TEACHERS SET ';
        let values = [];
        let updates = [];

        if (password !== null) {
            updates.push('PASSWORD = ?');
            values.push(password);
        }
        if (manager !== undefined) {
            updates.push('MANAGER = ?');
            values.push(manager);
        }

        if (updates.length === 0) {
            return { success: false, message: 'NO_UPDATES', status: 400 };
        }

        query += updates.join(', ') + ' WHERE TENANT_ID = ? AND TEACHER_ID = ?';
        values.push(tenantID, teacherID);

        const result = await connection.query(query, values);
        return { success: true, data: result[0] };
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteTeacher(tenantID, teacherID) {
    const connection = await db.getConnection();
    try {
        const existTenant = await tenantModel.getTenantByID(tenantID);
        const existTeacher = await getTeacherByID(tenantID, teacherID);

        if(existTenant.success === false && existTenant.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}
        if(existTeacher.success === false && existTeacher.message === 'NOT_FOUND') return {success: false, message: 'NOT_FOUND', status: 404}

        const query = 'DELETE FROM TEACHERS WHERE TENANT_ID = ? AND TEACHER_ID = ?';
        const values = [tenantID, teacherID];
        const result = await connection.query(query, values);
        
        return { success: true, data: result[0] };
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    createTeacher,
    getTeacherByID,
    getTeachers,
    updateTeacher,
    deleteTeacher
};