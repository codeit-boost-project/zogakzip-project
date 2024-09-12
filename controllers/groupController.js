import { PrismaClient } from '@prisma/client';
import { getBadgeIdsForGroup, grantBadgeToGroup } from './badgeController.js';
const prisma = new PrismaClient();

// 그룹 등록
export const registerGroup = async (req, res) => {
    try {
        const { name, imageUrl, introduction, isPublic, password } = req.body;
        const newGroup = await prisma.group.create({
            data: {
                name,
                imageUrl,
                introduction,
                isPublic,
                password,
                createdAt: new Date(),
            },
        });
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다", details: error.message });
    }
};

// 그룹 정보 수정
export const editGroup = async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId, 10);

      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        
      const { password, name, imageUrl, introduction, isPublic } = req.body;
  
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { 
          name, 
          imageUrl, 
          introduction, 
          isPublic,
        },
      });
  
      res.status(200).json({ message: '그룹이 성공적으로 수정되었습니다', group: updatedGroup });
    } catch (error) {
      res.status(500).json({ error: '그룹 수정 중 오류 발생', details: error.message });
    }
};

// 그룹 삭제
export const deleteGroup = async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId, 10);
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });

      const { password } = req.body;
  
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      await prisma.group.delete({ where: { id: groupId } });
      res.status(200).json({ message: '그룹이 성공적으로 삭제되었습니다' });
    } catch (error) {
      res.status(500).json({ error: '그룹 삭제 중 오류 발생', details: error.message });
    }
};

// 그룹 목록 조회
export const viewGroupList = async (req, res) => {
  try {
    // 요청에서 페이지, 페이지 크기, 정렬 기준, 검색 키워드, 공개 여부 가져오기
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword, isPublic } = req.query;

    const where = {};

    // 공개 여부 필터 설정 (isPublic이 정의되어 있으면 필터 적용)
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true'; // 문자열 'true'를 불리언 값으로 변환하여 사용
    }

    // 키워드 검색 (그룹 이름에 키워드가 포함된지 여부 확인, 대소문자 구분 안함)
    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' }; // 이름에 키워드 포함
    }

    // 정렬 기준 설정
    const orderBy =
      sortBy === 'latest' ? { createdAt: 'desc' } : // 최신순
      sortBy === 'mostLiked' ? { likeCount: 'desc' } : // 좋아요 순
      sortBy === 'mostPosted' ? { postCount: 'desc' } : // 게시글 수 순
      sortBy === 'mostBadge' ? { badgeCount: 'desc' } : // 배지 수 순
      { createdAt: 'desc' }; // 기본값: 최신순

    // 페이지네이션을 위한 시작점(skip)과 페이지 크기(take) 계산
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // 그룹 목록 조회 (게시글과 배지 포함)
    const groups = await prisma.group.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        posts: true, // 게시글 정보 포함
        badges: true,  // 배지 정보 포함
      }
    });

    // 각 그룹에 대해 배지 갯수를 확인하고 업데이트
    const groupsWithBadgeCount = await Promise.all(groups.map(async (group) => {
      // 그룹에 부여할 배지 ID 목록 가져오기
      const badgeIdsToGrant = await getBadgeIdsForGroup(group);
      // 배지를 그룹에 부여
      await grantBadgeToGroup(group.id, badgeIdsToGrant);

      // 그룹의 최신 배지 목록 가져오기
      const updatedGroup = await prisma.group.findUnique({
        where: { id: group.id },
        include: { badges: true },
      });

      // 업데이트된 배지 갯수 계산
      const updatedBadgeCount = updatedGroup.badges.length;

      // 배지 갯수를 업데이트
      await prisma.group.update({
        where: { id: group.id },
        data: { badgeCount: updatedBadgeCount },
      });

      return {
        ...group, // 기존 그룹 정보에 추가
        badgeCount: updatedBadgeCount, // 배지 갯수 포함
      };
    }));

    // 전체 그룹 수 계산
    const totalItemCount = await prisma.group.count({ where });
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 클라이언트로 응답 전송 (페이지 정보와 함께 그룹 목록 반환)
    res.status(200).json({
      currentPage: parseInt(page), // 현재 페이지
      totalPages, // 전체 페이지 수
      totalItemCount, // 전체 아이템 수
      data: groupsWithBadgeCount.map(group => ({
        id: group.id, // 그룹 ID
        name: group.name, // 그룹 이름
        imageUrl: group.imageUrl, // 이미지 URL
        isPublic: group.isPublic, // 공개 여부
        likeCount: group.likeCount, // 좋아요 수
        badgeCount: group.badgeCount, // 배지 수
        postCount: group.postCount, // 게시글 수
        createdAt: group.createdAt, // 생성일자
        introduction: group.introduction // 소개
      }))
    });
  } catch (error) {
    // 오류 발생 시 에러 응답 전송
    res.status(500).json({ error: 'Error retrieving group list', details: error.message });
  }
};

// 그룹 상세 정보 조회
export const viewGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params; // 요청에서 그룹 ID 가져오기
    const id = parseInt(groupId); // 문자열로 들어온 그룹 ID를 정수로 변환
    if (isNaN(id)) {
      // 잘못된 ID 처리
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 그룹 상세 정보 조회 (게시글과 배지 포함)
    const group = await prisma.group.findUnique({
      where: { id: id },
      include: {
        posts: true, // 게시글 정보 포함
        badges: true,  // 배지 정보 포함
      },
    });

    // 그룹이 존재하지 않으면 404 에러 반환
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 그룹에 대해 새로운 배지 확인 및 부여
    const newBadgeIds = await getBadgeIdsForGroup(group);
    await grantBadgeToGroup(group.id, newBadgeIds);

    // 업데이트된 그룹 정보 다시 조회
    const updatedGroup = await prisma.group.findUnique({
      where: { id: id },
      include: {
        badges: true, // 배지 포함
      },
    });

    // 배지 목록 가져오기
    const badges = updatedGroup.badges.map(b => b.name);

    // 그룹 상세 정보 응답 전송
    res.status(200).json({
      id: updatedGroup.id, // 그룹 ID
      name: updatedGroup.name, // 그룹 이름
      imageUrl: updatedGroup.imageUrl, // 이미지 URL
      isPublic: updatedGroup.isPublic, // 공개 여부
      likeCount: updatedGroup.likeCount, // 좋아요 수
      badges, // 배지 이름 배열
      postCount: updatedGroup.postCount, // 게시글 수
      createdAt: updatedGroup.createdAt, // 생성일자
      introduction: updatedGroup.introduction, // 소개
    });
  } catch (error) {
    // 오류 발생 시 에러 응답 전송
    console.error('Error retrieving group details:', error);
    res.status(500).json({ message: 'Error retrieving group details', details: error.message });
  }
};


// 그룹 조회 권한 확인
export const checkGroupPermissions = async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId, 10);
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
      
      const { password } = req.body;
  
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      if (!group) {
        return res.status(404).json({ message: '그룹을 찾을 수 없습니다' });
      }
  
      if (group.password !== password) {
        return res.status(401).json({ message: '비밀번호가 틀립니다' });
      }
  
      res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } catch (error) {
      res.status(500).json({ message: '비밀번호 확인 중 오류 발생', details: error.message });
    }
};

// 해당 그룹의 공개 여부 확인
export const checkGroupVisibility = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        }
  
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { id: true, isPublic: true }
        });
  
        if (!group) {
            return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
        }
  
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: '그룹 공개 여부 조회 중 오류 발생', details: error.message });
    }
};


// 그룹에 공감하기
export const likeGroup = async (req, res) => {
    try {
        // URL에서 groupId 추출 후 정수로 변환
        const groupId = parseInt(req.params.groupId, 10);

        // 유효하지 않은 그룹 ID의 경우
        if (isNaN(groupId)) {
            return res.status(400).json({ message: '유효하지 않은 그룹 ID입니다' });
        }

        // 그룹 정보 조회
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        // 그룹이 존재하지 않는 경우
        if (!group) {
            return res.status(404).json({ message: '존재하지 않는 그룹입니다' });
        }

        // 그룹의 likeCount 업데이트
        await prisma.group.update({
            where: { id: groupId },
            data: {
                likeCount: {
                    increment: 1
                }
            }
        });

        // 공감 성공 응답
        res.status(200).json({ message: '그룹 공감하기 성공' });
    } catch (error) {
        // 예기치 않은 오류 처리
        res.status(500).json({ message: '그룹 공감하기 중 오류 발생', details: error.message });
    }
};

// 게시물 등록
export const registerPost = async (req, res) => {
  try {
    const { groupId } = req.params; // URL 파라미터에서 groupId를 가져옴
    const { nickname, title, content, postPassword, groupPassword, imageUrl, tags, location, moment, isPublic } = req.body; // 요청 본문에서 데이터 가져오기

    // 필수 데이터가 모두 존재하는지 확인
    if (!nickname || !title || !content || !postPassword) {
      return res.status(400).json({ message: '잘못된 요청입니다. 필수 데이터가 누락되었습니다.' });
    }

    // 그룹 존재 여부 확인
    const group = await prisma.group.findUnique({
      where: { id: Number(groupId) }
    });

    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }

    // 비공개 그룹일 경우에만 비밀번호 검증
    if (!group.isPublic) {
      if (!groupPassword) {
        return res.status(400).json({ message: '비공개 그룹에 대한 비밀번호가 필요합니다.' });
      }

      if (group.password !== groupPassword) {
        return res.status(403).json({ message: '그룹 비밀번호가 일치하지 않습니다.' });
      }
    }

    // 게시글 생성
    const newPost = await prisma.post.create({
      data: {
        groupId: Number(groupId),
        nickname,
        title,
        content,
        password: postPassword, // postPassword는 post 모델의 password 필드로 저장
        imageUrl,
        tags: tags.join(','), // 배열을 문자열로 변환하여 저장
        location,
        moment: new Date(moment),
        isPublic: Boolean(isPublic), // 문자열로 받을 경우 불리언으로 변환
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
      }
    });

    // 그룹의 게시물 수 증가
    await prisma.group.update({
      where: { id: Number(groupId) },
      data: {
        postCount: group.postCount + 1
      }
    });

    // 성공 응답 반환
    res.status(200).json({
      id: newPost.id,
      groupId: newPost.groupId,
      nickname: newPost.nickname,
      title: newPost.title,
      content: newPost.content,
      imageUrl: newPost.imageUrl,
      tags: newPost.tags.split(','), // 저장된 문자열을 배열로 변환하여 반환
      location: newPost.location,
      moment: newPost.moment.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 반환
      isPublic: newPost.isPublic,
      likeCount: newPost.likeCount,
      commentCount: newPost.commentCount,
      createdAt: newPost.createdAt
    });

  } catch (error) {
    console.error('게시글 등록 중 오류 발생:', error);
    res.status(500).json({ error: '게시글 등록 중 오류 발생', details: error.message });
  }
};


// 게시글 목록 조회 함수
export const viewPostList = async (req, res) => {
  try {
    const { groupId } = req.params; // URL 파라미터에서 groupId를 가져옴
    const { page = 1, pageSize = 20, sortBy = 'latest', keyword, isPublic } = req.query; // 쿼리 파라미터에서 필터 및 페이징 옵션 가져옴

    // 필터링 객체 초기화
    const where = { groupId: Number(groupId) };

    // 공개 여부 필터 적용
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true'; // 문자열을 불리언으로 변환하여 필터링에 적용
    }

    // 검색어 필터 적용
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { tags: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 정렬 기준 설정
    const orderBy =
      sortBy === 'latest' ? { createdAt: 'desc' } :
      sortBy === 'mostCommented' ? { commentCount: 'desc' } :
      sortBy === 'mostLiked' ? { likeCount: 'desc' } :
      { createdAt: 'desc' }; // 기본값은 'latest'

    // 페이지네이션 설정
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // 게시글 목록 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    // 전체 아이템 수를 계산하여 총 페이지 수 계산
    const totalItemCount = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 조회 결과 응답
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: posts.map(post => ({
        id: post.id,
        nickname: post.nickname,
        title: post.title,
        imageUrl: post.imageUrl,
        tags: post.tags.split(','), // 저장된 문자열을 배열로 변환하여 반환
        location: post.location,
        moment: post.moment.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 반환
        isPublic: post.isPublic,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
      }))
    });
  } catch (error) {
    console.error('게시글 목록 조회 중 오류 발생:', error);
    res.status(500).json({ error: '게시글 목록 조회 중 오류 발생', details: error.message });
  }
};
