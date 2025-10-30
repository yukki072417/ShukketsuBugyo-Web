const router = require('express').Router();
const controller = require('../controllers/class.controller');
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, controller.createClasses);
router.get('/', controller.getClasses);
router.get('/unassigned', controller.getUnassignedStudents);
router.patch('/', controller.patchClasses);
router.delete('/', controller.deleteClasses)

module.exports = router
