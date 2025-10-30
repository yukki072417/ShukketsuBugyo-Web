const router = require('express').Router();
const controller = require('../controllers/student.controller');
const { isTeacher } = require('../services/authorize');
const csrfProtection = require('../middleware/csrf');

// All student routes should be protected and only accessible by teachers.
router.post('/', csrfProtection, isTeacher, controller.createStudent);
router.get('/all', isTeacher, controller.getStudents);
router.get('/class', isTeacher, controller.getStudentsInClass);
router.get('/one/:student_id', isTeacher, controller.getStudent);
router.patch('/:student_id', isTeacher, controller.patchStudent);
router.delete('/:student_id', isTeacher, controller.deleteStudent);

module.exports = router;