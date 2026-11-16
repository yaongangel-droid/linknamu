import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        🍂
      </span>
      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        주소가 바뀌었거나 존재하지 않는 페이지예요.
      </p>
      <Link
        href="/"
        className="flex min-h-11 items-center rounded-full bg-emerald-600 px-6 font-medium text-white hover:bg-emerald-700"
      >
        링크나무 홈으로
      </Link>
    </main>
  );
}
