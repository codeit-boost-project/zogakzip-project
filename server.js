import express from 'express';
import postRoutes from './routes/postRoutes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', postRoutes); // 게시글

// ES 모듈에서 __dirname과 __filename을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 'uploads' 디렉토리의 파일을 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 기본 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
