import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 모든 배지 가져오기
export const getAllBadges = async () => {
  try {
    return await prisma.badge.findMany();
  } catch (error) {
    console.error('배지 가져오기 실패:', error);
    throw error;
  }
};

// 그룹에 배지 부여
export const grantBadgeToGroup = async (groupId, badgeIds) => {
  try {
    // 그룹과 배지가 존재하는지 먼저 확인
    const [group, badges] = await Promise.all([
      prisma.group.findUnique({ where: { id: groupId } }),
      prisma.badge.findMany({ where: { id: { in: badgeIds } } })
    ]);

    if (!group) throw new Error('Group not found');
    if (badgeIds.length > 0 && badges.length !== badgeIds.length) {
      throw new Error('One or more badges do not exist');
    }

    // 기존 배지들과 중복되지 않는 새 배지 추가
    const existingBadges = await prisma.group.findUnique({
      where: { id: groupId },
      select: { badges: { select: { id: true } } }
    });

    const existingBadgeIds = existingBadges.badges.map(b => b.id);
    const newBadgeIds = badgeIds.filter(id => !existingBadgeIds.includes(id));

    if (newBadgeIds.length > 0) {
      await prisma.group.update({
        where: { id: groupId },
        data: {
          badges: {
            connect: newBadgeIds.map(badgeId => ({ id: badgeId }))
          }
        }
      });
      console.log(`그룹 ${groupId}에 배지 ${newBadgeIds} 부여 완료.`);
    }
  } catch (error) {
    console.error('배지 부여 실패:', error);
    throw error;
  }
};

// 특정 그룹에 대해 조건을 만족하는 배지 ID 목록 반환
export const getBadgeIdsForGroup = async (group) => {
  const badgeIds = [];
  const { createdAt, posts, likeCount } = group;

  // 7일 연속 게시물 작성
  const last7DaysPosts = posts.filter(post => (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24) < 7);
  const uniqueDays = new Set(last7DaysPosts.map(post => post.createdAt.toISOString().split('T')[0]));
  if (uniqueDays.size >= 7) badgeIds.push(1);

  // 게시물 수 20개 이상
  if (posts.length >= 20) badgeIds.push(2);

  // 그룹 생성 후 1년 경과
  if ((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24 * 365) >= 1) badgeIds.push(3);

  // 그룹 공감 수 : 10,000개 이상 달성
  if (likeCount >= 10000) badgeIds.push(4);

  // 게시물 공감 수 : 10,000개 이상 달성
  const hasPopularPost = posts.some(post => post.likeCount >= 10000);
  if (hasPopularPost) badgeIds.push(5);

  return badgeIds;
};
