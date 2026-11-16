import { after } from "next/server";
import { getVisibleLink, recordClick } from "@/lib/data";
import { isSafeUrl } from "@/lib/link-icon";

// 링크 클릭 → 원본 URL로 이동 (PRD F-03-2)
export async function GET(req: Request, ctx: RouteContext<"/r/[linkId]">) {
  const { linkId } = await ctx.params;

  let link;
  try {
    link = await getVisibleLink(linkId);
  } catch (err) {
    console.error("[redirect] 링크 조회 실패", err);
    return new Response("잠시 후 다시 시도해 주세요.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!link || !isSafeUrl(link.url)) {
    return new Response("링크를 찾을 수 없어요.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 클릭 집계는 응답을 보낸 뒤 처리 → 집계가 느리거나 실패해도 이동은 바로 됨
  const visitor = {
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown",
    userAgent: req.headers.get("user-agent") ?? "",
  };
  after(() =>
    recordClick(link.id, visitor).catch((err) =>
      console.error("[redirect] 클릭 집계 실패", err),
    ),
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: link.url,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
