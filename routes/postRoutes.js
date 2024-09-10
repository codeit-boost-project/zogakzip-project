import express from 'express';
import {
  registerPost,
  editPost,
  deletePost,
  viewPostList,
  viewPostDetails,
  checkPostPermissions,
  likePost,
  checkPostVisibility,
} from '../postController.js';

const router = express.Router();

// 게시글

router.post('/posts', registerPost); // 게시글 등록 -> 완료
router.put('/posts/:postId', editPost); // 게시글 수정 -> 완료
router.delete('/posts/:postId', deletePost); // 게시글 삭제 -> 완료

router.get('/posts', viewPostList); // 게시글 목록 조회 -> 완료
router.get('/posts/:postId', viewPostDetails); // 게시글 상세 정보 조회 -> 완료

router.post('/posts/:postId/verify-password', checkPostPermissions) // 게시글 조회 권한 확인 -> 완료
router.post('/posts/:postId/like', likePost) // 게시글 공감 하기 -> 완료
router.get('/posts/:postId/is-public', checkPostVisibility) // 게시글 공개 여부 확인 -> 완료