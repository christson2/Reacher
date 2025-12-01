const multer = require('multer');
const path = require('path');
const fs = require('fs');

const mediaPath = process.env.MEDIA_LOCAL_PATH || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, mediaPath);
    },
    filename: function (req, file, cb) {
        const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        cb(null, safe);
    }
});

const upload = multer({ storage });

module.exports = upload;
