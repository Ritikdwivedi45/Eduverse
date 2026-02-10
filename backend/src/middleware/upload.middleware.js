import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };
  
  let type;
  
  if (allowedTypes.image.includes(file.mimetype)) {
    type = 'image';
  } else if (allowedTypes.video.includes(file.mimetype)) {
    type = 'video';
  } else {
    return cb(new Error('Invalid file type'), false);
  }
  
  req.fileType = type;
  cb(null, true);
};

// Limits
const limits = {
  fileSize: {
    image: 5 * 1024 * 1024, // 5MB for images
    video: 500 * 1024 * 1024 // 500MB for videos
  }
};

// Create upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: limits.fileSize.image }
});

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: limits.fileSize.video }
});