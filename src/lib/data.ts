import "server-only";
import { createHash } from "node:crypto";
import { cache } from "react";
import { ObjectId } from "mongodb";
import { collections, type LinkDoc, type UserDoc } from "./mongodb";
import type { LinkItem, Profile, PublicPage } from "./types";

// 데이터 접근은 이 파일에서만 합니다.

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/; // PRD F-01-5

function toProfile(u: UserDoc): Profile {
  return {
    id: u._id.toHexString(),
    username: u.username,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
  };
}

function toLinkItem(l: LinkDoc): LinkItem {
  return {
    id: l._id.toHexString(),
    userId: l.userId.toHexString(),
    title: l.title,
    url: l.url,
    position: l.position,
    isVisible: l.isVisible,
    clickCount: l.clickCount,
  };
}

/** 공개 페이지용: 프로필 + 공개(숨김 아님) 링크를 순서대로 반환 */
export const getPublicPage = cache(
  async (username: string): Promise<PublicPage | null> => {
    const name = username.toLowerCase();
    if (!USERNAME_RE.test(name)) return null;

    const { users, links } = await collections();
    const user = await users.findOne({ username: name });
    if (!user) return null;

    const linkDocs = await links
      .find(
        { userId: user._id, isVisible: true },
        { projection: { clickCount: 0 } }, // 클릭 수는 공개 페이지에 내려보내지 않음 (F-03-4)
      )
      .sort({ position: 1 })
      .toArray();

    return {
      profile: toProfile(user),
      links: linkDocs.map((l) => toLinkItem({ ...l, clickCount: 0 })),
    };
  },
);

/** 리디렉션용: 공개 링크 하나를 반환 */
export async function getVisibleLink(linkId: string): Promise<LinkItem | null> {
  if (!ObjectId.isValid(linkId) || linkId.length !== 24) return null;
  const { links } = await collections();
  const link = await links.findOne({
    _id: new ObjectId(linkId),
    isVisible: true,
  });
  return link ? toLinkItem(link) : null;
}

const DEDUPE_SECONDS = 10; // PRD F-03-6
const BOT_UA_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|whatsapp|telegram|kakaotalk-scrap|headless/i;

/**
 * 클릭 수 +1 (PRD F-03-1, F-03-6)
 * - 봇 User-Agent는 제외
 * - 같은 방문자(IP+UA 해시)가 10초 안에 다시 누르면 1회로 처리
 * - 원본 IP는 저장하지 않고, 해시도 10초 후 자동 삭제
 */
export async function recordClick(
  linkId: string,
  visitor: { ip: string; userAgent: string },
): Promise<void> {
  if (BOT_UA_RE.test(visitor.userAgent)) return;

  const { links, clickDedupe } = await collections();
  const key = createHash("sha256")
    .update(`${linkId}|${visitor.ip}|${visitor.userAgent}`)
    .digest("hex");

  try {
    await clickDedupe.insertOne({
      _id: key,
      expireAt: new Date(Date.now() + DEDUPE_SECONDS * 1000),
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      // 키가 이미 있음 = 10초 이내 재클릭. 단, TTL 삭제는 최대 1분 늦을 수 있어 만료 여부를 직접 확인
      const existing = await clickDedupe.findOne({ _id: key });
      if (existing && existing.expireAt > new Date()) return;
      await clickDedupe.updateOne(
        { _id: key },
        { $set: { expireAt: new Date(Date.now() + DEDUPE_SECONDS * 1000) } },
      );
    } else {
      throw err;
    }
  }

  await links.updateOne(
    { _id: new ObjectId(linkId) },
    { $inc: { clickCount: 1 } },
  );
}
