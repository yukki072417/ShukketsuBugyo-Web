const { formatResponse } = require('../services/format');
const teacherModel = require('../models/teacher.model');
const { errorHandle } = require('../services/errorHandle');

async function getTeacherData(tenantID, teacherID) {
    if (!tenantID || !teacherID) {
        errorHandle('BAD_REQUEST', 400);
    }

    const result = await teacherModel.getTeacherByID(tenantID, teacherID);
    if (result.success === false) {
        errorHandle(result.message, result.status || 500);
    }

    const response = formatResponse(result.data);
    if (response.success === false) {
        errorHandle(response.message, response.status || 500);
    }

    delete response.data[0].password;
    return response.data[0];
}

module.exports = { getTeacherData };