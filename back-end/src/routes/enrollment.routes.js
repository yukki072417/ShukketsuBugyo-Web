const router = require('express').Router();
const controller = require('../controllers/enrollment.controller');
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, controller.createEnrollments);
router.get('/', controller.getEnrollments);
router.get('/one/:enrollment_id', controller.getEnrollment);
router.patch('/:enrollment_id', csrfProtection, controller.patchEnrollment);
router.delete('/:enrollment_id', csrfProtection, controller.deleteEnrollment);

router.get('/lesson/:lesson_id', controller.getEnrollmentsByLessonID);

module.exports = router;
