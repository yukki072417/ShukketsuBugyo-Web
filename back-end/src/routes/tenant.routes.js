const router = require('express').Router();
const controller = require('../controllers/tenant.controller');

router.post('/', controller.createTenant);
router.get('/:tenant_id', controller.getTenantByID);
router.patch('/:tenant_id', controller.patchTenant);
router.delete('/:tenant_id', controller.deleteTenant);

module.exports = router;