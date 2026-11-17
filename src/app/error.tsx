"use client"; // 오류 화면은 클라이언트 컴포넌트여야 합니다

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        🌧️
      </span>
      <h1 className="text-xl font-bold">잠시 문제가 생겼어요</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        페이지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-600 px-6 font-medium text-white hover:bg-emerald-700"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
