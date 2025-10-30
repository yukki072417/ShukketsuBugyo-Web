const router = require("express").Router();
const controller = require("../controllers/lesson.controller");
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, controller.createLessons);
router.get('/all', controller.getLessons);
router.get('/one/:lesson_id', controller.getLesson);
router.patch('/:lesson_id', controller.patchLesson);
router.delete('/:lesson_id', controller.deleteLesson);

module.exports = router;