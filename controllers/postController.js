import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

//게시글 등록
export const registerPost = async (req, res) => {
  try{
    // URL 또는 본문에서 groupId를 추출
    const groupId = parseInt(req.params.groupId, 10) || req.body.groupId;

    // groupId가 유효하지 않은 경우
    if (!groupId || isNaN(groupId)) {
      return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다'});
    }

    const {nickname, title, imageUrl, content, tags, location, moment, isPublic, password } = req.body;
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 게시글 생성
    const newPost = await prisma.post.create({
      data: {
        groupId,
        nickname,
        title,
        imageUrl,
        content,
        tags,
        location,
        moment,
        isPublic,
        password: hashedPassword,
        createdAt: new Date(),
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: '잘못된 요청입니다', details: error.message});
  }
};

//게시글 수정
export const editPost = async (req, res) => {
  try {
    // URL에서 postId 추출 후 정수로 변환
    const postId = parseInt(req.params.postId, 10);

    // postId가 유효하지 않은 경우
    if (isNaN(postId)) {
      return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다' });
    }

    // 요청 본문에서 수정할 데이터 추출
    const { password, nickname, title, imageUrl, content, tags, location, moment, isPublic } = req.body;

    // 게시글 ID로 게시글 찾기
    const post = await prisma.post.findUnique({ where: { id: postId } });

    // 게시글이 존재하지 않는 경우
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
    }

    // 제공된 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, post.password);
    if (!passwordMatch) {
      return res.status(403).json({ error: '잘못된 비밀번호입니다' });
    }

    // 게시글 정보를 업데이트
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        nickname,
        title,
        imageUrl,
        content,
        tags,
        location,
        moment,
        isPublic,
      },
    });

    // 업데이트된 게시글 정보 반환
    res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다', post: updatedPost });
  } catch (error) {
    // 예기치 않은 오류 처리
    res.status(500).json({ error: '게시글 수정 중 오류 발생했습니다', details: error.message });
  }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
  try {
    // URL에서 postId 추출
    const postId = parseInt(req.params.postId, 10);

    // postId가 유효하지 않은 경우
    if (isNaN(postId)) {
      return res.status(400).json({ message: '유효하지 않은 게시글 ID입니다' });
    }

    // 요청 본문에서 Password 추출
    const { password } = req.body;

    // 게시글 찾기
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    // 게시글이 존재하지 않는 경우
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다' });
    }

    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, post.password);
    if (!passwordMatch) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId },
    });

    // 삭제 성공 응답
    res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다' });
  } catch (error) {
    // 서버 오류 처리
    res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다', details: error.message });
  }
};

// 게시글 목록 조회
export const viewPostList = async (req, res) => {
  try {
    // pageSize: 한 페이지에 출력할 그룹 수 조정
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic, groupId } = req.query;

    // 숫자형으로 변환
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    // 공개, 비공개 목록 조회
    let whereConditions = {
      isPublic: isPublic === 'true', // 문자열로 전달되므로 boolean으로 변환
      groupId: parseInt(groupId, 10) || undefined, // groupId가 있을 때만 사용
    };

    // 게시글 검색 (제목 또는 태그에서 검색)
    if (keyword) {
      whereConditions.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { tags: { has: keyword } }, // 태그가 키워드와 일치하는 항목
      ];
    }

    // 정렬 기준 설정
    let orderBy;
    switch (sortBy) {
      case 'mostCommented':
        orderBy = { commentCount: 'desc' };
        break;
      case 'mostLiked':
        orderBy = { likeCount: 'desc' };
        break;
      default: // 최신순 (latest)
        orderBy = { createdAt: 'desc' };
    }

    // 게시글 총 개수 조회
    const totalItemCount = await prisma.post.count({
      where: whereConditions,
    });

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalItemCount / size);

    // 게시글 목록 조회 (페이지네이션 적용)
    const posts = await prisma.post.findMany({
      where: whereConditions,
      orderBy: orderBy,
      skip: (pageNumber - 1) * size, // 페이지네이션 처리
      take: size, // 페이지당 항목 수
      select: {
        id: true,
        nickname: true,
        title: true,
        imageUrl: true,
        tags: true,
        location: true,
        moment: true,
        isPublic: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
      },
    });

    // 응답 데이터 구성
    res.status(200).json({
      currentPage: pageNumber,
      totalPages: totalPages,
      totalItemCount: totalItemCount,
      data: posts,
    });
  } catch (error) {
    // 예외 처리
    res.status(400).json({ message: '잘못된 요청입니다', details: error.message });
  }
};

// 게시글 상세 정보 조회
export const viewPostDetails = async (req, res) => {
  try {
    const { postId } = req.params;

    // 게시글 ID로 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: {
        id: true,
        groupId: true,
        nickname: true,
        title: true,
        content: true,
        imageUrl: true,
        tags: true,
        location: true,
        moment: true, 
        isPublic: true,
        likeCount: true, 
        commentCount: true, 
        createdAt: true, 

        // 게시글에 달린 댓글 목록 조회
        comments: {
          select: {
            id: true,
            content: true,
            nickname: true,
            createdAt: true,
          },
        },
      },
    });

    // 게시글이 없을 경우
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 응답 데이터 전송
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다', details: error.message });
  }
};

// 게시글 조회 권한 확인
export const checkPostPermissions = async (req, res) => {
  try {
    const { postId } = req.params;  // 게시글 ID
    const { password } = req.body;   // 입력된 비밀번호

    // 게시글 ID로 해당 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    // 게시글이 없을 경우
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 비밀번호 확인
    if (post.password === password) {
      // 비밀번호가 일치할 경우
      return res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } else {
      // 비밀번호가 일치하지 않을 경우
      return res.status(401).json({ message: '비밀번호가 틀렸습니다' });
    }
  } catch (error) {
    // 잘못된 요청 처리
    res.status(400).json({ message: '잘못된 요청입니다', details: error.message });
  }
};

//게시글 공감하기
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    // 게시글 ID로 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    // 게시글이 없을 경우
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 공감수 증가
    const likePost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        likeCount: {
          increment: 1, // 공감수를 1 증가시킴
        },
      },
    });

    // 공감 성공 응답
    res.status(200).json({ likeCount: likePost.likeCount });
  } catch (error) {
    // 예기치 않은 오류 처리
    res.status(400).json({ message: '잘못된 요청입니다', details: error.message });
  }
};

// 해당 게시글의 공개 여부 확인
export const checkPostVisibility = async (req, res) => {
  try {
    const { postId } = req.params;  // 게시글 ID

    // 게시글 ID로 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: {
        id: true,
        isPublic: true,  // 공개 여부
      },
    });

    // 게시글이 없을 경우
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 게시글 공개 여부 응답
    res.status(200).json({
      id: post.id,
      isPublic: post.isPublic,
    });
  } catch (error) {
    // 예기치 않은 오류 처리
    res.status(400).json({ message: '잘못된 요청입니다', details: error.message });
  }
};
