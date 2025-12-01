const express = require('express');
const router = express.Router();
const videoCtrl = require('../controllers/videoController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', auth.optional, videoCtrl.listVideos);
router.get('/:id', auth.optional, videoCtrl.getVideo);

router.post('/', auth.required, upload.single('video'), videoCtrl.uploadVideo);
router.put('/:id', auth.required, videoCtrl.updateCaption);
router.delete('/:id', auth.required, videoCtrl.deleteVideo);

module.exports = router;
