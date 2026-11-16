import Image from "next/image";
import type { Profile } from "@/lib/types";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  const { displayName, bio, avatarUrl } = profile;
  const initial = Array.from(displayName.trim())[0] ?? "?";

  return (
    <header className="flex flex-col items-center gap-3 text-center">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${displayName} 프로필 사진`}
          width={96}
          height={96}
          unoptimized
          priority
          className="size-24 rounded-full object-cover ring-2 ring-white shadow-md dark:ring-zinc-800"
        />
      ) : (
        <div
          role="img"
          aria-label={`${displayName} 기본 프로필`}
          className="flex size-24 items-center justify-center rounded-full bg-emerald-600 text-4xl font-bold text-white shadow-md"
        >
          {initial}
        </div>
      )}
      <h1 className="mt-1 text-xl font-bold break-all">{displayName}</h1>
      {bio && (
        <p className="max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400 break-keep">
          {bio}
        </p>
      )}
    </header>
  );
}
