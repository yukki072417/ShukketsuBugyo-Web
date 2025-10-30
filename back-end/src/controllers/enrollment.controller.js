const enrollmentModel = require('../models/enrollment.model');
const { errorHandle } = require('../services/errorHandle');
const { formatResponse, enrollmentStatus } = require('../services/format');

async function createEnrollments(req, res) {
    const body = req.body;
    const tenantID = req.tenant_id;

    try {
        if (!Array.isArray(body) || body.length === 0 || body.some(e => !e.student_id || !e.lesson_id)) {
            return errorHandle('BAD_REQUEST', 400);
        }
        await enrollmentModel.createEnrollments(tenantID, body);
        res.status(201).json({ result: 'SUCCESS' });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getEnrollments(req, res) {
    const tenantID = req.tenant_id;
    const filters = req.query;

    try {
        const result = await enrollmentModel.getEnrollments(tenantID, filters);

        const formattedData = formatResponse(result.data).data;
        formattedData.forEach((item) => {
            delete item.tenant_id;
        });

        res.status(result.status).json({ result: 'SUCCESS', data: formattedData });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getEnrollment(req, res) {
    const tenantID = req.tenant_id;
    const enrollmentID = req.params.enrollment_id;

    try {
        const result = await enrollmentModel.getEnrollmentByID(tenantID, enrollmentID);
        const response = formatResponse([result.data]).data[0];
        response.status = enrollmentStatus[response.status];
        delete response.tenant_id;

        res.status(result.status).json({ result: 'SUCCESS', data: response });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function patchEnrollment(req, res) {
    const tenantID = req.tenant_id;
    const enrollmentID = req.params.enrollment_id;
    const { status } = req.body;

    try {
        if (status === undefined || !Number.isInteger(status)) {
            return errorHandle('BAD_REQUEST', 400);
        }
        await enrollmentModel.patchEnrollment(tenantID, enrollmentID, status);
        res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function deleteEnrollment(req, res) {
    const tenantID = req.tenant_id;
    const enrollmentID = req.params.enrollment_id;

    if (!tenantID || !enrollmentID) return errorHandle('BAD_REQUEST', 400);

    try {
        const result = await enrollmentModel.deleteEnrollment(tenantID, enrollmentID);
        res.status(result.status).send();
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getEnrollmentsByLessonID(req, res) {
    const tenantID = req.tenant_id;
    const lessonID = req.params.lesson_id;

    try {
        const result = await enrollmentModel.getEnrollmentsByLessonID(tenantID, lessonID);

        const formattedData = formatResponse(result.data).data;
        formattedData.forEach((item) => {
            delete item.tenant_id;
        });

        res.status(result.status).json({ result: 'SUCCESS', data: formattedData });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

module.exports = {
    createEnrollments,
    getEnrollments,
    getEnrollment,
    patchEnrollment,
    deleteEnrollment,
    getEnrollmentsByLessonID
}
