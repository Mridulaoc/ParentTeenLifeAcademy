import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const extname = allowedVideoTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedVideoTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Videos Only! (mp4, mov, avi, mkv, webm)"));
  }
};

const videoUploadDir = path.join(__dirname, "../uploads/videos");

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export default uploadVideo;
