const { formatResponse } = require('../services/format');
const timetableModel = require('../models/timetable.model');
const { errorHandle } = require('../services/errorHandle');

async function createTimetable(req, res) {
    const tenantID = req.tenant_id;
    const { grade, class: className, period, lesson_id, day_of_week } = req.body;

    try {
        const result = await timetableModel.createTimetable(tenantID, grade, className, period, lesson_id, day_of_week);
        res.status(result.status).json({ result: 'SUCCESS' });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getTimetable(req, res) {
    const tenantID = req.tenant_id;
    const { grade, class: className } = req.query;

    if (!grade || !className) {
        return res.status(400).json({ result: 'ERROR', message: 'BAD_REQUEST' });
    }

    try {
        const result = await timetableModel.getTimetable(tenantID, grade, className);
        res.status(result.status).json(formatResponse(result.data));
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function updateTimetable(req, res) {
    const tenantID = req.tenant_id;
    const { grade, class: className, period, lesson_id, day_of_week } = req.body;

    try {
        const result = await timetableModel.updateTimetable(tenantID, grade, className, period, lesson_id, day_of_week);
        res.status(result.status).json({ result: 'SUCCESS' });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function deleteTimetable(req, res) {
    const tenantID = req.tenant_id;
    const { grade, class: className, period, day_of_week } = req.query;

    if (!grade || !className || !period || !day_of_week) {
        return res.status(400).json({ result: 'ERROR', message: 'BAD_REQUEST' });
    }

    try {
        const result = await timetableModel.deleteTimetable(tenantID, grade, className, period, day_of_week);
        res.status(result.status).json({ result: 'SUCCESS' });
    } catch (error) {
        res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

module.exports = {
    createTimetable,
    getTimetable,
    updateTimetable,
    deleteTimetable
};