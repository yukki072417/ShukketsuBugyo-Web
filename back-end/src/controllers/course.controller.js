const courseModel = require('../models/course.model');
const { errorHandle } = require('../services/errorHandle');
const { formatResponse } = require('../services/format');

async function createCourse(req, res) {
    const tenantID = req.tenant_id;
    const body = req.body;
    
    try {
        if(!Array.isArray(body) || body.length === 0) errorHandle('BAD_REQUEST', 400);

        const result = await courseModel.createCourse(tenantID, body);
        
        if(result.success === false) errorHandle(result.message, result.status || 500);

        return res.status(result.status).json({ result: 'SUCCESS', data: result.data });
    }catch(error){
        return res.status(error.status || 500).json({ error: error.message || 'SERVER_ERROR' });
    }
}

async function getCourses(req, res) {
    const tenantID = req.tenant_id;
    
    try {        
        if(!tenantID) return errorHandle('BAD_REQUEST', 400);

        const result = await courseModel.getCourses(tenantID);
        const response = formatResponse(result.data);

        response.data.forEach((item) => delete item.tenant_id)

        if(response.success === false) errorHandle(response.message, response.status || 500);

        res.status(result.status).json({ result: 'SUCCESS', data: response.data });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'SERVER_ERROR' });
    }
}

async function patchCourses(req, res) {
    const tenantID = req.tenant_id;
    const body = req.body;

    try {
        if(!tenantID) errorHandle('BAD_REQUEST', 400);

        const result = await courseModel.patchCourses(tenantID, body);

        if(result.success === false) errorHandle(result.message, result.status || 500);

        return res.status(result.status).json({ result: 'SUCCESS', data: result.data });
    }catch(error){
        return res.status(error.status || 500).json({ error: error.message || 'SERVER_ERROR' });
    }
}

async function deleteCourse(req, res) {
    const tenantID = req.tenant_id;
    const courseID = req.params.course_id;
    try {
        if(!tenantID || !courseID) errorHandle('BAD_REQUEST', 400);

        const result = await courseModel.deleteCourse(tenantID, courseID);

        if(result.success === false) errorHandle(result.message, result.status || 500);

        return res.status(result.status).json({ result: 'SUCCESS', data: result.data });
    }catch(error){
        return res.status(error.status || 500).json({ error: error.message || 'SERVER_ERROR' });
    }
}

module.exports = {
    createCourse,
    getCourses,
    patchCourses,
    deleteCourse
}