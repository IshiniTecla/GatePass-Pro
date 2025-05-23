// middleware/fileUpload.js
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter: fileFilter
});

// Middleware function to handle single file uploads
export const uploadSingleFile = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware function to handle multiple file uploads
export const uploadMultipleFiles = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};

// Middleware function for multiple fields with different file counts
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Default export for backward compatibility (optional)
export default {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFields
};