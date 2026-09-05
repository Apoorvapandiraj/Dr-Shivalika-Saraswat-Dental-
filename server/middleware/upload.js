const multer = require('multer');

const uploadConfig = {
  storage: multer.memoryStorage(), // memory storage -> upload to Cloudinary
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB per image (memory-DoS guard)
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      video: ['video/mp4', 'video/quicktime', 'video/webm'],
      image: ['image/jpeg', 'image/png', 'image/webp'],
    };
    const type = req.body.uploadType || 'image';
    if ((allowedMimes[type] || allowedMimes.image).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid ${type} format`));
    }
  },
};

// Patient video reels — strict: video only, 50MB cap (security: prevents abuse)
const VIDEO_MIMES = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // 50MB, single file
  fileFilter: (req, file, cb) => {
    if (VIDEO_MIMES[file.mimetype]) cb(null, true);
    else cb(new Error('Only MP4, WebM or MOV videos are allowed'));
  },
});

module.exports = { upload: multer(uploadConfig), uploadConfig, videoUpload, VIDEO_MIMES };
