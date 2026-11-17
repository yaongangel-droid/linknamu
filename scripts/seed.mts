// 데모 데이터 넣기:  npm run db:seed
// (.env.local의 MONGODB_URI를 사용합니다. 기존 demo 사용자와 그 링크는 지우고 다시 만듭니다.)
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI가 없어요. .env.local을 먼저 만들어 주세요.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "linknamu");
  const users = db.collection("users");
  const links = db.collection("links");

  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  await links.createIndex({ userId: 1, position: 1 });
  await db
    .collection("click_dedupe")
    .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

  const old = await users.findOne({ username: "demo" });
  if (old) {
    await links.deleteMany({ userId: old._id });
    await users.deleteOne({ _id: old._id });
  }

  const now = new Date();
  const { insertedId: userId } = await users.insertOne({
    email: "demo@example.com",
    username: "demo",
    displayName: "홍길동",
    bio: "프론트엔드 개발자 · 블로거",
    avatarUrl: "/profile.jpg",
    createdAt: now,
    updatedAt: now,
  });

  const items: [string, string, boolean][] = [
    ["GitHub", "https://github.com", true],
    ["기술 블로그", "https://tistory.com", true],
    ["인스타그램", "https://instagram.com", true],
    ["유튜브 채널", "https://youtube.com", true],
    ["포트폴리오", "https://example.com", true],
    ["숨긴 링크", "https://example.com/hidden", false],
  ];
  await links.insertMany(
    items.map(([title, url, isVisible], position) => ({
      userId,
      title,
      url,
      position,
      isVisible,
      isFeatured: title === "포트폴리오",
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    })),
  );

  console.log(`✓ demo 사용자와 링크 ${items.length}개를 넣었어요 → http://localhost:3000/demo`);
} finally {
  await client.close();
}
