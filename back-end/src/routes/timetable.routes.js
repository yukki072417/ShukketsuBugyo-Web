const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, timetableController.createTimetable);
router.get('/', csrfProtection, timetableController.getTimetable);
router.patch('/', csrfProtection, timetableController.updateTimetable);
router.delete('/', csrfProtection, timetableController.deleteTimetable);

module.exports = router;