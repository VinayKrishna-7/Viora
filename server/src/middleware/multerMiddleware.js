const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File Type Filter
const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid video format. Allowed: MP4, WebM, QuickTime, MKV'), false);
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar' || file.fieldname === 'banner' || file.fieldname === 'image') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF'), false);
    }
  } else {
    cb(new ApiError(400, `Unexpected field name: ${file.fieldname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  },
});

const uploadVideoAndThumbnail = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

const uploadThumbnailOnly = upload.single('thumbnail');
const uploadImageOnly = upload.single('image');

module.exports = {
  upload,
  uploadVideoAndThumbnail,
  uploadThumbnailOnly,
  uploadImageOnly,
};
