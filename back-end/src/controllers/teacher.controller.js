const { formatResponse } = require('../services/format');
const teacherModel = require('../models/teacher.model');
const authorize = require('../services/authorize');
const bcrypt = require('bcryptjs');
const { errorHandle } = require('../services/errorHandle');
const { getTeacherData } = require('./teacher.helper');

async function signup(req, res) {
    const { tenant_id: tenantID, teacher_id: teacherID, teacher_password: password, manager } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await teacherModel.createTeacher(tenantID, teacherID, hashedPassword, manager);
        if(result.success === true) return res.status(201).json({result: 'SUCCESS'});
        else errorHandle(result.message, result.status || 500);
    } catch (error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function login(req, res) {
    const { tenant_id: tenantID, teacher_id: teacherID, teacher_password: password } = req.body;

    try {
        const result = await teacherModel.getTeacherByID(tenantID, teacherID);
        if(result.success === false && result.message === 'NOT_FOUND') errorHandle('NOT_FOUND', 404);

        const passwordMatched = bcrypt.compareSync(password, result.data[0].PASSWORD);
        const manager = result.data[0].MANAGER === 1 ? true : false;
        
        if(tenantID !== result.data[0].TENANT_ID || !passwordMatched) errorHandle('WRONG_PASSWORD', 401);

        return res.status(200).json({ result: 'SUCCESS', token: authorize.createJWTs(tenantID, teacherID, 'teacher', manager) });
    }catch(error){
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getTeacherByID(req, res) {
    const tenantID = req.tenant_id;
    const teacherID = req.params.teacher_id;

    try {
        const data = await getTeacherData(tenantID, teacherID);
        return res.status(200).json({result: 'SUCCESS', data});
    } catch(error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function whoami(req, res) {
    const tenantID = req.tenant_id;
    const teacherID = req.user_id;

    try {
        const data = await getTeacherData(tenantID, teacherID);
        return res.status(200).json({result: 'SUCCESS', data});
    } catch(error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getTeachers(req, res) {
    const tenantID = req.tenant_id;
    if(!tenantID) return res.status(400).json({result: 'ERROR', message: 'BAD_REQUEST'});

    try {
        const result = await teacherModel.getTeachers(tenantID);
        if(result.success === false){
            errorHandle(result.message, result.status || 500);
        }

        const response = formatResponse(result.data).success === true ? formatResponse(result.data) : null;
        response.data.forEach((item) => {
            delete item.password;
            item.manager = item.manager === 1 ? true : false;
        });

        if(response === null){
            errorHandle('SERVER_ERROR', 500);
        }

        return res.status(200).json({result: 'SUCCESS', data: response.data});
    }catch(error){
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function updateTeacher(req, res) {
    const tenantID = req.tenant_id;
    const teacherID = req.params.teacher_id;
    const { password, manager } = req.body;

    try {
        let hashedPassword = null;
        if (password) {
            hashedPassword = bcrypt.hashSync(password, 10);
        }
        
        const result = await teacherModel.updateTeacher(tenantID, teacherID, hashedPassword, manager);
        if (result.success === false) {
            errorHandle(result.message, result.status || 500);
        }
        return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function deleteTeacher(req, res) {
    const tenantID = req.tenant_id;
    const teacherID = req.params.teacher_id;

    try {
        const result = await teacherModel.deleteTeacher(tenantID, teacherID);
        if (result.success === false) {
            errorHandle(result.message, result.status || 500);
        }
        return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

module.exports = {
    signup,
    login,

    getTeacherByID,
    whoami,
    getTeachers,
    updateTeacher,
    deleteTeacher
};