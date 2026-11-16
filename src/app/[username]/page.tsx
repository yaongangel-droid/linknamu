import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import { getPublicPage } from "@/lib/data";

// 방문자는 대부분 SNS에서 바로 들어오므로, 데이터를 다 읽은 뒤 한 번에 그립니다.
// (없는 사용자명에 404 상태 코드를 정확히 돌려주고, OG 메타 태그도 함께 내려보냄)
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const page = await getPublicPage(username);
  if (!page) return { title: "페이지를 찾을 수 없어요 | 링크나무" };

  const { displayName, bio, avatarUrl } = page.profile;
  const title = `${displayName} | 링크나무`;
  return {
    title,
    description: bio,
    openGraph: {
      title,
      description: bio,
      type: "profile",
      images: avatarUrl ? [avatarUrl] : undefined,
    },
    twitter: { card: "summary", title, description: bio },
  };
}

export default async function PublicLinkPage({
  params,
}: PageProps<"/[username]">) {
  const { username } = await params;
  const page = await getPublicPage(username);
  if (!page) notFound();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-4 pt-12 pb-8">
        <ProfileHeader profile={page.profile} />

        {page.links.length > 0 ? (
          <ul className="flex w-full flex-col gap-3">
            {page.links.map((link) => (
              <li key={link.id}>
                <LinkCard link={link} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">아직 등록된 링크가 없어요.</p>
        )}

        <footer className="mt-auto pt-6 text-xs text-zinc-400">
          made with{" "}
          <Link href="/" className="font-semibold text-emerald-600 hover:underline">
            링크나무
          </Link>
        </footer>
      </main>
    </div>
  );
}
