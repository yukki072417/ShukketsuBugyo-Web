const router = require('express').Router();
const controller = require('../controllers/teacher.controller');

router.get('/:teacher_id', controller.getTeacherByID);
router.delete('/:teacher_id', controller.deleteTeacher);
router.patch('/:teacher_id', controller.updateTeacher);
router.get('/get/me', controller.whoami);
router.get('/get/all', controller.getTeachers);

module.exports = router;