const express = require('express');

const mediaController = require('../controllers/mediaController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { mediaIdParamSchema, uploadMediaSchema } = require('../validators/mediaSchemas');

const router = express.Router();

router.post('/upload', auth, validate({ body: uploadMediaSchema }), mediaController.uploadMedia);
router.get('/:id', auth, validate({ params: mediaIdParamSchema }), mediaController.getMediaById);
router.delete('/:id', auth, validate({ params: mediaIdParamSchema }), mediaController.deleteMediaById);

module.exports = router;
