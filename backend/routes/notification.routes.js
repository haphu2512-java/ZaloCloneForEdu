const express = require('express');

const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { notificationIdParamSchema, notificationPaginationQuerySchema } = require('../validators/notificationSchemas');

const router = express.Router();

router.get('/', auth, validate({ query: notificationPaginationQuerySchema }), notificationController.listNotifications);
router.put('/:id/read', auth, validate({ params: notificationIdParamSchema }), notificationController.markNotificationRead);

module.exports = router;
