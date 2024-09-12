import express from 'express';
import groupRoutes from './routes/groupRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

const app = express();

// CORS 및 JSON 파서 설정
app.use(cors());
app.use(express.json());

// ES 모듈에서 __dirname과 __filename을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// morgan을 사용하여 로그를 콘솔에 출력 (배포 환경 포함)
app.use(morgan('combined'));

// API 라우팅 설정
app.use('/api', groupRoutes); // 그룹
app.use('/api', commentRoutes); // 댓글
app.use('/api', postRoutes); // 게시글
app.use('/api/image', imageRoutes); // 이미지

// 'uploads' 디렉토리의 파일을 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 존재하지 않는 경로 처리
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// 오류 처리 미들웨어 (오류를 콘솔에 그대로 출력)
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack); // 콘솔에 오류 스택 출력

  res.status(err.status || 500).json({
    message: err.message || 'Something broke!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
