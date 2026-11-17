import type { PublicPage } from "./types";

/**
 * 개발 중 MONGODB_URI가 비어 있을 때만 쓰는 화면 확인용 데이터입니다.
 * 배포 환경(production)에서는 절대 사용되지 않습니다.
 */
export const useDevFallback =
  process.env.NODE_ENV === "development" && !process.env.MONGODB_URI;

export const devDemoPage: PublicPage = {
  profile: {
    id: "dev-user",
    username: "demo",
    displayName: "홍길동",
    bio: "프론트엔드 개발자 · 블로거",
    avatarUrl: "/profile.jpg",
  },
  links: [
    ["GitHub", "https://github.com"],
    ["기술 블로그", "https://tistory.com"],
    ["인스타그램", "https://instagram.com"],
    ["유튜브 채널", "https://youtube.com"],
    ["포트폴리오", "https://example.com"],
  ].map(([title, url], position) => ({
    id: `dev-${position}`,
    userId: "dev-user",
    title,
    url,
    position,
    isVisible: true,
    isFeatured: title === "포트폴리오",
    clickCount: 0,
  })),
};
