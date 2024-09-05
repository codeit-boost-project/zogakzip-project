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
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);

      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        
      // 요청 본문에서 수정할 데이터 추출
      const { password, name, imageUrl, introduction, isPublic } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ error: '그룹 ID가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      // 제공된 비밀번호 검증
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      // 그룹 정보를 업데이트
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { 
          name, 
          imageUrl, 
          introduction, 
          isPublic,
        },
      });
  
      // 업데이트된 그룹 정보 반환
      res.status(200).json({ message: '그룹이 성공적으로 수정되었습니다', group: updatedGroup });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ error: '그룹 수정 중 오류 발생', details: error.message });
    }
  };


// 그룹 삭제
export const deleteGroup = async (req, res) => {
    try {
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);
      
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });

      // 요청 본문에서 비밀번호 추출
      const { password } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ error: '그룹 ID가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      // 제공된 비밀번호 검증
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      // 그룹 삭제
      await prisma.group.delete({ where: { id: groupId } });
      res.status(200).json({ message: '그룹이 성공적으로 삭제되었습니다' });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ error: '그룹 삭제 중 오류 발생', details: error.message });
    }
  };


// 그룹 목록 조회
export const viewGroupList = async (req, res) => {
  try {
    // 한 페이지에 출력할 그룹 수 조정 = pageSize
    const { page = 1, pageSize = 8, sortBy = 'latest', keyword, isPublic } = req.query;

    const where = {};

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true'; 
    }

    // 그룹명 검색
    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' }; 
    }

    const orderBy =
      sortBy === 'latest' ? { createdAt: 'desc' } :
      sortBy === 'mostLiked' ? { likeCount: 'desc' } :
      sortBy === 'mostPosted' ? { postCount: 'desc' } :
      sortBy === 'mostBadge' ? { badgeCount: 'desc' } :
      { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // 그룹 목록 조회
    const groups = await prisma.group.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        posts: true,
        groupBadges: { select: { badgeId: true } }, // Load existing badges
      }
    });

// 그룹별로 배지 개수 계산 및 부여
const groupsWithBadgeCount = await Promise.all(groups.map(async (group) => {
  // 그룹의 활동 및 조건에 따라 배지 ID를 가져온다
  const badgeIdsToGrant = await getBadgeIdsForGroup(group);

  // (이미 부여되지 않은 경우) 그룹에 배지를 부여
  await grantBadgeToGroup(group.id, badgeIdsToGrant);

  // 그룹의 배지 개수를 업데이트
  const updatedGroupBadges = await prisma.groupBadge.findMany({
    where: { groupId: group.id },
  });

  const updatedBadgeCount = updatedGroupBadges.length;

  // 새로운 배지 개수로 그룹을 업데이트
  await prisma.group.update({
    where: { id: group.id },
    data: { badgeCount: updatedBadgeCount },
  });

  return {
    ...group,
    badgeCount: updatedBadgeCount,
  };
}));

    // 전체 아이템 수를 이용한 페이지 계산
    const totalItemCount = await prisma.group.count({ where });
    const totalPages = Math.ceil(totalItemCount / pageSize);

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: groupsWithBadgeCount.map(group => ({
        id: group.id,
        name: group.name,
        imageUrl: group.imageUrl,
        isPublic: group.isPublic,
        likeCount: group.likeCount,
        badgeCount: group.badgeCount, 
        postCount: group.postCount,
        createdAt: group.createdAt,
        introduction: group.introduction
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving group list', details: error.message });
  }
};


// 그룹 상세 정보 조회
export const viewGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // groupId를 정수로 변환하여 유효성 검사
    const id = parseInt(groupId);
    if (isNaN(id)) {
      return res.status(400).json({ message: '잘못된 요청입니다' });
    }

    // 그룹 정보 조회 (게시물 및 기존 뱃지 포함)
    const group = await prisma.group.findUnique({
      where: { id: id },
      include: {
        posts: true,
        groupBadges: {
          include: {
            badge: true, 
          },
        },
      },
    });

    // 그룹이 존재하지 않는 경우
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 그룹에 대해 새로운 뱃지 확인 및 부여
    const newBadgeIds = await getBadgeIdsForGroup(group);
    await grantBadgeToGroup(group.id, newBadgeIds);

    // 뱃지 정보 다시 로드 (업데이트된 상태 반영)
    const updatedGroup = await prisma.group.findUnique({
      where: { id: id },
      include: {
        groupBadges: {
          include: {
            badge: true, 
          },
        },
      },
    });

    // 그룹이 획득한 배지 목록 생성
    const badges = updatedGroup.groupBadges.map(gb => gb.badge.name);

    
    res.status(200).json({
      id: updatedGroup.id,
      name: updatedGroup.name,
      imageUrl: updatedGroup.imageUrl,
      isPublic: updatedGroup.isPublic,
      likeCount: updatedGroup.likeCount,
      badges, 
      postCount: updatedGroup.postCount,
      createdAt: updatedGroup.createdAt,
      introduction: updatedGroup.introduction,
    });
  } catch (error) {
    console.error('Error retrieving group details:', error);
    res.status(500).json({ message: 'Error retrieving group details', details: error.message });
  }
};


// 그룹 조회 권한 확인
export const checkGroupPermissions = async (req, res) => {
    try {
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);
      
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
      
      // 요청 본문에서 비밀번호 추출
      const { password } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ message: '그룹 ID가 필요합니다' });
      }
  
      // 비밀번호가 제공되지 않은 경우
      if (!password) {
        return res.status(400).json({ message: '비밀번호가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ message: '그룹을 찾을 수 없습니다' });
      }
  
      // 비밀번호 확인
      if (group.password !== password) {
        return res.status(401).json({ message: '비밀번호가 틀립니다' });
      }
  
      // 비밀번호가 맞으면 성공 메시지 반환
      res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ message: '비밀번호 확인 중 오류 발생', details: error.message });
    }
  };


// 해당 그룹의 공개 여부 확인
export const checkGroupVisibility = async (req, res) => {
    try {
        // URL에서 groupId 추출 후 정수로 변환
        const groupId = parseInt(req.params.groupId, 10);
  
        // 유효하지 않은 그룹 ID의 경우
        if (isNaN(groupId)) {
            return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        }
  
        // 그룹 정보 조회
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { id: true, isPublic: true } // 필요한 필드만 선택
        });
  
        // 그룹이 존재하지 않는 경우
        if (!group) {
            return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
        }
  
        // 그룹 공개 여부 응답
        res.status(200).json(group);
    } catch (error) {
        // 예기치 않은 오류 처리
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

