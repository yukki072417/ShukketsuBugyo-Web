const { format } = require('mysql2');
const classModel = require('../models/class.model');
const { errorHandle } = require('../services/errorHandle');
const { formatResponse } = require('../services/format');

async function createClasses(req, res) {
    const tenantID = req.tenant_id;
    const bodies = req.body;
    try {
        if(!Array.isArray(bodies)) errorHandle('BAD_REQUEST', 400);
        await classModel.createClasses(tenantID, bodies);
        
        res.status(207).json({result: 'SUCCESS'});

    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message});
    }
}

async function getClasses(req, res) {
    const tenantID = req.tenant_id;
    
    try {
        const result = await classModel.getClasses(tenantID);

        const response = formatResponse(result.data).data;
        response.forEach((item) => delete item.tenant_id)
        
        return res.status(200).json({ result: 'SUCCESS', data:  response});
    } catch (error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message});
    }
}

async function getUnassignedStudents(req, res) {
    const tenantID = req.tenant_id;
    
    try {
        const result = await classModel.getUnassignedStudents(tenantID);
        return res.status(200).json({ result: 'SUCCESS', data: formatResponse(result.data).data });
    } catch (error) {
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message});
    }
}

async function patchClasses(req, res) {
    const tenantID = req.tenant_id;
    const bodies = req.body;

    try {
        if(!Array.isArray(bodies)) errorHandle('BAD_REQUEST', 400);
        const result = await classModel.patchClasses(tenantID, bodies);

        if(result.success) return res.status(200).json({ result: 'SUCCESS'});
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'SERVER_ERROR' });       
    }
}

async function deleteClasses(req, res) {
    const tenantID = req.tenant_id;
    const { grade, class:className } = req.query;
    try {
        const result = await classModel.deleteClass(tenantID, grade, className);

        if(result.success != true) throw errorHandle('SERVER_ERROR', 500);

        return res.status(200).json({ result: 'SUCCESS'})
    } catch (error) {
        res.status(error.status || 500).json({result: 'ERROR', message: error.message || 'SERVER_ERROR'});
    }
}
module.exports = {
    createClasses,
    getClasses,
    patchClasses,
    deleteClasses,
    getUnassignedStudents
}