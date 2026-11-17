import "server-only";
import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";

// ── 컬렉션 문서 타입 ─────────────────────────────────────────
export interface UserDoc {
  _id: ObjectId;
  email: string;
  username: string; // unique
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkDoc {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  url: string;
  position: number;
  isVisible: boolean;
  isFeatured?: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** 10초 내 중복 클릭 판별용. IP는 해시로만 넣고, TTL 인덱스로 자동 삭제 (PRD 6. 개인정보) */
export interface ClickDedupeDoc {
  _id: string;
  expireAt: Date;
}

// ── 클라이언트 (개발 중 HMR로 연결이 계속 늘어나지 않도록 전역에 보관) ──
const globalForMongo = globalThis as unknown as {
  _mongoClient?: Promise<MongoClient>;
  _mongoIndexes?: Promise<unknown>;
};

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI가 없어요. .env.example을 .env.local로 복사하고 값을 채워 주세요.",
    );
  }
  globalForMongo._mongoClient ??= new MongoClient(uri).connect();
  return globalForMongo._mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  const db = client.db(process.env.MONGODB_DB || "linknamu");
  globalForMongo._mongoIndexes ??= ensureIndexes(db).catch((err) => {
    globalForMongo._mongoIndexes = undefined; // 다음 요청에서 다시 시도
    console.error("[mongodb] 인덱스 생성 실패", err);
  });
  return db;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection<UserDoc>("users").createIndex({ username: 1 }, { unique: true }),
    db.collection<UserDoc>("users").createIndex({ email: 1 }, { unique: true }),
    db.collection<LinkDoc>("links").createIndex({ userId: 1, position: 1 }),
    db
      .collection<ClickDedupeDoc>("click_dedupe")
      .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export async function collections(): Promise<{
  users: Collection<UserDoc>;
  links: Collection<LinkDoc>;
  clickDedupe: Collection<ClickDedupeDoc>;
}> {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    links: db.collection<LinkDoc>("links"),
    clickDedupe: db.collection<ClickDedupeDoc>("click_dedupe"),
  };
}
