import Link from "next/link";
import { inspect } from "@/lib/dev-inspect";

export default function Hero() {
  return (
    <section
      {...inspect("Hero (랜딩 첫 화면)", "src/components/Hero.tsx")}
      className="flex w-full max-w-md flex-col items-center gap-6 px-4 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        🌳
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">링크나무</h1>
      <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
        내 모든 링크를 한 페이지에 모아 두고,
        <br />
        하나의 URL로 공유하세요.
      </p>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup"
          className="flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-6 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          무료로 시작하기
        </Link>
        <Link
          href="/login"
          className="flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}
