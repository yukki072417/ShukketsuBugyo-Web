const router = require('express').Router();
const controller = require('../controllers/course.controller');

router.post('/', controller.createCourse);
router.get('/', controller.getCourses);
router.patch('/', controller.patchCourses);
router.delete('/:course_id', controller.deleteCourse);

module.exports = router;