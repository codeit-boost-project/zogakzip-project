import { PrismaClient } from '@prisma/client';
import {
  GROUPS,
  POSTS,
  COMMENTS
} from './mock.js';

const prisma = new PrismaClient();


// 배지 종류
const badges = [
  { id: 1, name: "7일 연속 게시글 등록" },
  { id: 2, name: "게시글 수 20개 이상 등록" },
  { id: 3, name: "그룹 생성 후 1년 달성" },
  { id: 4, name: "그룹 공감 1만 개 이상 받기" },
  { id: 5, name: "게시글 공감 1만 개 이상 받기" }
];


async function main() {

  // 기존 데이터 삭제
  await prisma.badge.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.group.deleteMany();


  // 그룹 데이터 시딩
  const createdGroups = await Promise.all(
    GROUPS.map(async (group) => {
      return prisma.group.create({ data: group });
    })
  );

  // 게시글 데이터 시딩
  const createdPosts = await Promise.all(
    POSTS.map(async (post, index) => {
      return prisma.post.create({ 
        data: {
          ...post,
          groupId: createdGroups[index].id // 생성된 그룹 ID 사용
        }
      });
    })
  );

  // 댓글 데이터 시딩
  await Promise.all(
    COMMENTS.map(async (comment, index) => {
      return prisma.comment.create({
        data: {
          ...comment,
          postId: createdPosts[index % createdPosts.length].id // 생성된 게시글 ID 사용
        }
      });
    })
  );


  // 뱃지 데이터 시딩
  await prisma.badge.createMany({
      data: badges,
      skipDuplicates: true,
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
