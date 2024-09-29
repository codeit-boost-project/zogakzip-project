import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/imageController.js';

// Multer 설정: 이미지를 업로드할 경로와 파일명을 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // 이미지가 저장될 경로
  },
  filename: (req, file, cb) => {
    
    // 파일명을 안전하게 인코딩
    const originalName = encodeURIComponent(file.originalname); // URL 인코딩
    cb(null, originalName); // 인코딩된 파일명으로 설정
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/', upload.single('image'), uploadImage); // /image 경로로 POST 요청이 들어왔을 때 uploadImage 함수 실행

export default router;
