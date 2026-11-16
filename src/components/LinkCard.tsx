import { getLinkIcon } from "@/lib/link-icon";
import type { LinkItem } from "@/lib/types";

export default function LinkCard({ link }: { link: LinkItem }) {
  const icon = getLinkIcon(link.url);

  return (
    <a
      // 클릭 집계를 위해 원본 URL 대신 리디렉션 경로로 보냅니다 (PRD F-03-2)
      href={`/r/${link.id}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex min-h-14 w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span
        aria-hidden="true"
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${icon.className}`}
      >
        {icon.label}
      </span>
      <span className="flex-1 truncate text-center font-medium">{link.title}</span>
      {/* 아이콘 너비만큼 비워 제목을 가운데 정렬 */}
      <span aria-hidden="true" className="size-9 shrink-0" />
    </a>
  );
}
