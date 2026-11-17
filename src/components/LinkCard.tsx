import { inspect } from "@/lib/dev-inspect";
import { getLinkIcon } from "@/lib/link-icon";
import type { LinkItem } from "@/lib/types";

const BASE =
  "group relative flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:translate-y-0";

const NORMAL =
  "border-zinc-200 bg-white shadow-sm hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900";

// 강조 링크: 연한 핑크 그라데이션 배경 + 진한 핑크 글씨 + 은은한 빛
const FEATURED =
  "min-h-16 border-pink-200 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-900 shadow-lg shadow-pink-300/40 ring-2 ring-pink-200 ring-offset-2 ring-offset-zinc-50 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-300/50 dark:ring-offset-zinc-950";

export default function LinkCard({ link }: { link: LinkItem }) {
  const icon = getLinkIcon(link.url);
  const featured = link.isFeatured;

  return (
    <a
      {...inspect(`LinkCard (링크 카드: ${link.title})`, "src/components/LinkCard.tsx")}
      // 클릭 집계를 위해 원본 URL 대신 리디렉션 경로로 보냅니다 (PRD F-03-2)
      href={`/r/${link.id}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`${BASE} ${featured ? FEATURED : NORMAL}`}
    >
      {featured && (
        <span className="absolute -top-2.5 right-3 rounded-full bg-pink-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
          ⭐ 추천
        </span>
      )}
      <span
        aria-hidden="true"
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          featured ? "bg-white/70 text-pink-600" : icon.className
        }`}
      >
        {icon.label}
      </span>
      <span
        className={`flex-1 truncate text-center ${featured ? "text-lg font-bold" : "font-medium"}`}
      >
        {link.title}
      </span>
      {/* 아이콘 너비만큼 비워 제목을 가운데 정렬 */}
      <span aria-hidden="true" className="size-9 shrink-0" />
    </a>
  );
}
