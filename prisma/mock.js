export const GROUPS = [
  {
    name: "달봉이네 가족",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "달봉이네 추억 상자입니다. 가족의 소중한 기억들을 함께 나눠요.",
    isPublic: true,
    password: "family123",
    createdAt: new Date("2023-10-02"),
    likeCount: 10000,
    postCount: 1,
  },
  {
    name: "여행 애호가들",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "여행지에서의 추억을 나누는 공간입니다.",
    isPublic: true,
    password: "travel123",
    createdAt: new Date("2023-11-15"),
    likeCount: 12000,
    postCount: 8,
  },
  {
    name: "스포츠 팬클럽",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "스포츠와 관련된 추억을 나누는 팬클럽입니다.",
    isPublic: true,
    password: "sports123",
    createdAt: new Date("2011-09-01"),
    likeCount: 18000,
    postCount: 6,
  },
  {
    name: "독서 클럽",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "읽었던 책과 느꼈던 감상을 기억해요.",
    isPublic: false,
    password: "book123",
    createdAt: new Date("2024-08-22"),
    likeCount: 8000,
    postCount: 5,
  },
  {
    name: "등산 동호회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "등산의 순간과 풍경을 함께 기억하는 모임입니다.",
    isPublic: true,
    password: "hike123",
    createdAt: new Date("2022-11-15"),
    likeCount: 20000,
    postCount: 7,
  },
  {
    name: "음악 감상",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "음악으로 남긴 기억들을 공유합니다.",
    isPublic: false,
    password: "music123",
    createdAt: new Date(),
    likeCount: 17000,
    postCount: 4,
  },
  {
    name: "사진 동호회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "사진을 통해 남긴 추억을 나누는 그룹입니다.",
    isPublic: true,
    password: "photo123",
    createdAt: new Date(),
    likeCount: 5000,
    postCount: 9,
  },
  {
    name: "요가 클래스",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "요가 수련 중 느낀 순간들을 기억합니다.",
    isPublic: true,
    password: "yoga123",
    createdAt: new Date(),
    likeCount: 9000,
    postCount: 3,
  },
  {
    name: "영화 감상 클럽",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "영화를 통해 느꼈던 감동을 기록하고 공유합니다.",
    isPublic: false,
    password: "movie123",
    createdAt: new Date(),
    likeCount: 14000,
    postCount: 2,
  },
  {
    name: "요리 연구회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    introduction: "다양한 요리와 그 순간을 기억하는 모임입니다.",
    isPublic: true,
    password: "cook123",
    createdAt: new Date(),
    likeCount: 25000,
    postCount: 10,
  },
];

export const POSTS = [
  {
    nickname: "달봉이",
    title: "오늘 인천에서 월척을 낚았어요!",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "인천에서 가족과 함께한 낚시에서 월척을 낚았어요. 모두가 놀랐던 순간!",
    tags: "가족, 낚시, 인천",
    location: "인천, 한국",
    moment: new Date("2023-06-15"),
    isPublic: true,
    password: "fish123",
    likeCount: 5000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "Traveler1",
    title: "파리에서의 아름다운 저녁",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "에펠탑을 배경으로 한 아름다운 저녁. 잊을 수 없는 순간입니다.",
    tags: "여행, 파리",
    location: "파리, 프랑스",
    moment: new Date("2023-07-20"),
    isPublic: true,
    password: "paris123",
    likeCount: 6000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "SportyFan",
    title: "2024 올림픽 경기 관람",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "2024 올림픽에서의 경기 관람. 현장의 열기가 대단했어요!",
    tags: "올림픽, 경기, 스포츠",
    location: "파리, 프랑스",
    moment: new Date("2023-08-10"),
    isPublic: true,
    password: "olympic123",
    likeCount: 7500,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "BookLover",
    title: "첫 독서 모임의 추억",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "독서 모임에서 함께했던 첫날. 다양한 이야기를 나눴던 그 시간.",
    tags: "독서, 모임",
    location: "부산, 한국",
    moment: new Date("2023-09-05"),
    isPublic: true,
    password: "bookclub123",
    likeCount: 3000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "HikerJoe",
    title: "설악산 등반의 기쁨",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "친구들과 함께한 설악산 등반. 정상에서의 기쁨은 말로 표현할 수 없어요.",
    tags: "등산, 설악산",
    location: "강원도, 한국",
    moment: new Date("2023-10-01"),
    isPublic: true,
    password: "hike123",
    likeCount: 8000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "MusicFan",
    title: "첫 콘서트에서의 감동",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "어렸을 때 처음 갔던 콘서트. 그날의 감동은 아직도 생생해요.",
    tags: "음악, 콘서트",
    location: "뉴욕, 미국",
    moment: new Date("2023-11-15"),
    isPublic: true,
    password: "concert123",
    likeCount: 7000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "PhotoGrapher",
    title: "첫 사진 전시회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "제가 찍은 사진들이 전시된 첫 전시회. 정말 잊을 수 없는 기억이에요.",
    tags: "사진, 전시회",
    location: "서울, 한국",
    moment: new Date("2023-12-05"),
    isPublic: true,
    password: "photo123",
    likeCount: 4000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "YogaLover",
    title: "해변에서의 아침 요가",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "바닷바람을 맞으며 즐긴 해변에서의 아침 요가. 최고의 힐링 시간이었어요.",
    tags: "요가, 해변",
    location: "하와이, 미국",
    moment: new Date("2024-01-10"),
    isPublic: true,
    password: "yoga123",
    likeCount: 6000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "MovieBuff",
    title: "영화 '기생충' 상영회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "친구들과 함께 한 기생충 상영회. 다시 보니 더욱 의미가 깊었어요.",
    tags: "영화, 기생충",
    location: "서울, 한국",
    moment: new Date("2024-02-15"),
    isPublic: true,
    password: "movie123",
    likeCount: 9000,
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    nickname: "ChefMaster",
    title: "최고의 요리 경연대회",
    imageUrl: "https://web-project-mkuy.onrender.com/uploads/1725426705171.jpg",
    content: "요리 경연대회에서 우승했던 순간. 그날의 환호성과 기쁨이 아직도 느껴져요.",
    tags: "요리, 경연대회",
    location: "도쿄, 일본",
    moment: new Date("2024-03-20"),
    isPublic: true,
    password: "cook123",
    likeCount: 11000,
    commentCount: 3,
    createdAt: new Date(),
  },
];

export const COMMENTS = [
  {
    nickname: "FishingFan",
    content: "와! 정말 대단해요. 그때의 기쁨이 느껴져요!",
    createdAt: new Date(),
    password: "fish123"
  },
  {
    nickname: "ParisLover",
    content: "파리의 저녁 정말 아름다웠겠네요. 사진이 너무 멋져요!",
    createdAt: new Date(),
    password: "paris123"
  },
  {
    nickname: "OlympicsFan",
    content: "올림픽 경기 현장의 열기가 그대로 전해지네요! 정말 멋진 경험이었겠어요.",
    createdAt: new Date(),
    password: "olym123"
  },
  {
    nickname: "Bookworm",
    content: "독서 모임 너무 재밌어 보여요. 다음 모임에도 꼭 참여하고 싶어요.",
    createdAt: new Date(),
    password: "read123"
  },
  {
    nickname: "HikingLover",
    content: "설악산 정상에서의 사진 멋져요. 꼭 한 번 가보고 싶어요!",
    createdAt: new Date(),
    password: "mountain123"
  },
  {
    nickname: "ConcertFan",
    content: "첫 콘서트의 감동이 전해져요. 정말 특별한 순간이었겠네요!",
    createdAt: new Date(),
    password: "concert123"
  },
  {
    nickname: "PhotoEnthusiast",
    content: "전시회 축하드려요! 사진들이 정말 인상 깊어요.",
    createdAt: new Date(),
    password: "photo123"
  },
  {
    nickname: "BeachLover",
    content: "해변에서의 요가라니 너무 평화롭겠어요. 멋진 경험이었을 것 같아요.",
    createdAt: new Date(),
    password: "yoga123"
  },
  {
    nickname: "MovieCritic",
    content: "기생충 다시 보기 정말 좋았겠네요. 상영회가 더 특별했겠어요!",
    createdAt: new Date(),
    password: "movie123"
  },
  {
    nickname: "CookFanatic",
    content: "요리 경연대회 우승 축하드려요! 멋진 순간이었을 거예요.",
    createdAt: new Date(),
    password: "win123"
  },
];
