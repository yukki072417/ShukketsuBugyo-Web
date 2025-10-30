const { formatResponse } = require('../services/format')
const lessonModel = require('../models/lesson.model');
const { errorHandle } = require('../services/errorHandle');

async function createLessons(req, res) {
    const tenantID = req.tenant_id;
    const lessons = req.body;

    try {
        const result = await lessonModel.createLessons(tenantID, lessons);
        res.status(result.status).json({ result: 'SUCCESS', data: result.data});
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR' ,message: error.message });
    }
}

async function getLessons(req, res) {
    const tenantID = req.tenant_id;

    try {
        const result = await lessonModel.getLessons(tenantID);

        result.data = formatResponse(result.data).data;
        result.data.map((lesson) => delete lesson.tenant_id);

        res.status(result.status).json({ result: 'SUCCESS', data: result.data});
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR' ,message: error.message });
    }
}

async function getLesson(req, res) {
    const tenantID = req.tenant_id;
    const lessonID = req.params.lesson_id;

    if(tenantID == null || lessonID == null) errorHandle('BAD_REQUEST', 400);

    try {
        const result = await lessonModel.getLesson(tenantID, lessonID);

        if(result.success === false) errorHandle(result.message, result.status || 500); 

        result.data = formatResponse(result.data).data;
        delete result.data[0].tenant_id;

        res.status(result.status).json({ result: 'SUCCESS', data: result.data[0]});
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR' ,message: error.message });
    }
}

async function patchLesson(req, res) {
    const tenantID = req.tenant_id;
    const lessonID = req.params.lesson_id;
    const { lesson_name, lesson_name_en, grade } = req.body;

    try {
        const result = await lessonModel.patchLesson(tenantID, lessonID, lesson_name, lesson_name_en, grade);
        res.status(result.status).json({ result: 'SUCCESS', data: result.data});
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR', message: error.message });
    }
}

async function deleteLesson(req, res) {
    const tenantID = req.tenant_id;
    const lessonID = req.params.lesson_id;

    if(!lessonID) return res.status(400).json({ result: 'ERROR', message: 'BAD_REQUEST' });

    try {
        const result = await lessonModel.deleteLesson(tenantID, lessonID);
        res.status(result.status).json({ result: 'SUCCESS'});
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR', message: error.message });
    }
}

module.exports = {
    createLessons,
    getLessons,
    getLesson,
    patchLesson,
    deleteLesson
};