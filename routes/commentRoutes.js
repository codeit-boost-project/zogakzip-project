import express from 'express';
import { 
  editComment, 
  deleteComment,
} from '../controllers/commentController.js';

const router = express.Router();

/* 특정 게시물에서의 댓글 등록, 댓글 목록 조회 */

router.delete('/:commentId', deleteComment); // 댓글 삭제 -> 완료
router.put('/:commentId', editComment); // 댓글 수정 -> 완료

export default router;