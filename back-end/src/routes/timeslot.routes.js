const router = require('express').Router();
const controller = require('../controllers/timeslot.controller');
const csrfProtection = require('../middleware/csrf');

router.post('/', csrfProtection, controller.createTimeslot);
router.get('/', controller.getTimeslots);
router.patch('/:current_period', controller.patchTimeslots);
router.delete('/:current_period', controller.deleteTimeslot);

module.exports = router;