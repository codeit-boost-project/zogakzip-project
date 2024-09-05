import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 댓글 등록
export const registerComment = async (req, res) => {
  const { postId } = req.params; // URL 매개변수에서 postId 가져오기
  const { nickname, content, password } = req.body; // 요청 본문에서 댓글 정보 가져오기

  // 요청 본문에서 필수 필드 검증
  if (!nickname || !content || !password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 댓글 등록
    const newComment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        nickname,
        content,
        password,
      },
    });

    // 성공적인 응답 반환
    return res.status(200).json({
      id: newComment.id,
      nickname: newComment.nickname,
      content: newComment.content,
      createdAt: newComment.createdAt,
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 등록 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};



// 댓글 목록 조회
export const viewCommentList = async (req, res) => {
  const { postId } = req.params; // URL 매개변수에서 postId 가져오기
  const { page = 1, pageSize = 10 } = req.query; // 페이지와 페이지 크기 쿼리 파라미터 가져오기

  // 페이지와 페이지 크기 검증
  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 댓글 총 개수 조회
    const totalItemCount = await prisma.comment.count({
      where: { postId: parseInt(postId) },
    });

    // 댓글 목록 조회
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }, // 최신 댓글부터 정렬
    });

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 성공적인 응답 반환
    return res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: comments.map(comment => ({
        id: comment.id,
        nickname: comment.nickname,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 목록 조회 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};


// 댓글 삭제
export const deleteComment = async (req, res) => {
  const { commentId } = req.params; 
  const { password } = req.body;

  // 비밀번호 확인
  if (!password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // 댓글이 존재하지 않는 경우
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    // 비밀번호 확인
    if (comment.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 삭제
    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    // 성공적인 응답 반환
    return res.status(200).json({ message: '답글 삭제 성공' });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 삭제 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};



// 댓글 수정
export const editComment = async (req, res) => {
  const { commentId } = req.params; 
  const { nickname, content, password } = req.body; 

  // 필수 필드 확인
  if (!nickname || !content || !password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // 댓글이 존재하지 않는 경우
    if (!comment) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    // 비밀번호 확인
    if (comment.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 수정
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        nickname,
        content,
      },
    });

    // 성공적인 응답 반환
    return res.status(200).json({
      id: updatedComment.id,
      nickname: updatedComment.nickname,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 수정 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};


