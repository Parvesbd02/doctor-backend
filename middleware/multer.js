// backend/middleware/multer.js

import multer from "multer";
import path from "path";
import fs from "fs";

// Define storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(null, true); // Allow no file selected
    } else {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    }
  },
});

export default upload;
