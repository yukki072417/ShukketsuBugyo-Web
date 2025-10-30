const router = require('express').Router();
const controller = require('../controllers/attendance.controller');
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, controller.createAttendances);
router.get('/date/:lesson_id', controller.getAttendanceInDate);
router.get('/id/:lesson_id', controller.getAttendanceByLesson);
router.post('/student-lesson', controller.getAttendanceByStudentLesson);
router.patch('/', csrfProtection, controller.patchAttendances);
router.delete('/:enrollment_id', controller.deleteAttendance);

module.exports = router