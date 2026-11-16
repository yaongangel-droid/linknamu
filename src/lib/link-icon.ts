export interface LinkIcon {
  label: string;
  className: string;
}

const RULES: { match: (host: string) => boolean; icon: LinkIcon }[] = [
  { match: (h) => h.endsWith("instagram.com"), icon: { label: "IG", className: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white" } },
  { match: (h) => h.endsWith("youtube.com") || h === "youtu.be", icon: { label: "YT", className: "bg-red-600 text-white" } },
  { match: (h) => h.endsWith("github.com"), icon: { label: "GH", className: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" } },
  { match: (h) => h === "blog.naver.com" || h === "m.blog.naver.com", icon: { label: "N", className: "bg-green-500 text-white" } },
  { match: (h) => h.endsWith("tistory.com"), icon: { label: "T", className: "bg-orange-500 text-white" } },
  { match: (h) => h.endsWith("x.com") || h.endsWith("twitter.com"), icon: { label: "X", className: "bg-black text-white dark:bg-white dark:text-black" } },
  { match: (h) => h.endsWith("linkedin.com"), icon: { label: "in", className: "bg-sky-700 text-white" } },
  { match: (h) => h.endsWith("tiktok.com"), icon: { label: "TT", className: "bg-zinc-900 text-white" } },
];

const DEFAULT_ICON: LinkIcon = {
  label: "🔗",
  className: "bg-zinc-100 dark:bg-zinc-800",
};

/** URL 도메인에 맞는 아이콘을 고릅니다 (PRD F-02-4) */
export function getLinkIcon(url: string): LinkIcon {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return RULES.find((r) => r.match(host))?.icon ?? DEFAULT_ICON;
  } catch {
    return DEFAULT_ICON;
  }
}

/** http/https URL만 허용합니다 (javascript: 등 차단) */
export function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
