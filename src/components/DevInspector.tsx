"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 개발 전용 구성요소 선택 도구
 * 1) 오른쪽 아래 버튼으로 선택 모드를 켭니다.
 * 2) 마우스를 올리면 구성요소가 강조되고, 클릭하면 선택됩니다.
 * 3) 수정 요청을 적고 "프롬프트 복사"를 누르면 Claude에 붙여 넣을 문장이 복사됩니다.
 */

interface Target {
  el: HTMLElement;
  name: string;
  file: string;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const UI_ATTR = "data-inspector-ui";

function findTarget(node: EventTarget | null): Target | null {
  if (!(node instanceof Element) || node.closest(`[${UI_ATTR}]`)) return null;
  const el = node.closest<HTMLElement>("[data-component]");
  if (!el) return null;
  return {
    el,
    name: el.dataset.component ?? "",
    file: el.dataset.file ?? "",
  };
}

function boxOf(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function buildPrompt(t: Target, request: string) {
  return [
    "[링크나무 구성요소 수정]",
    `구성요소: ${t.name}`,
    `파일: ${t.file}`,
    `요청: ${request.trim()}`,
  ].join("\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 클립보드 API를 쓸 수 없는 환경용 예비 방법
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function DevInspector() {
  // 배포 빌드에서는 이 조건이 항상 참이 되어, 아래 Inspector 코드가 통째로 빠집니다.
  if (process.env.NODE_ENV !== "development") return null;
  return <Inspector />;
}

function Inspector() {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState<Target | null>(null);
  const [selected, setSelected] = useState<Target | null>(null);
  const [request, setRequest] = useState("");
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [, forceRender] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const close = useCallback(() => {
    setActive(false);
    setHover(null);
    setSelected(null);
    setRequest("");
    setCopied("idle");
  }, []);

  // 선택 모드: 마우스 올리기 / 클릭 가로채기
  useEffect(() => {
    if (!active || selected) return;

    const onMove = (e: MouseEvent) => setHover(findTarget(e.target));
    const onClick = (e: MouseEvent) => {
      const t = findTarget(e.target);
      if (!t) return;
      e.preventDefault(); // 링크 이동 막기
      e.stopPropagation();
      setSelected(t);
      setHover(null);
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.body.style.cursor = "crosshair";
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.body.style.cursor = "";
    };
  }, [active, selected]);

  // Esc로 닫기, 스크롤·화면 크기 변경 시 강조 상자 위치 다시 계산
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onReflow = () => forceRender((n) => n + 1);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [active, close]);

  useEffect(() => {
    if (selected) textareaRef.current?.focus();
  }, [selected]);

  const shown = selected ?? hover;
  const box = shown?.el.isConnected ? boxOf(shown.el) : null;

  const onCopy = async () => {
    if (!selected || !request.trim()) return;
    const ok = await copyText(buildPrompt(selected, request));
    setCopied(ok ? "ok" : "fail");
  };

  return (
    <div {...{ [UI_ATTR]: "" }}>
      {/* 강조 상자 */}
      {active && box && shown && (
        <div
          className="pointer-events-none fixed z-[9998] rounded-md border-2 border-sky-500 bg-sky-500/10 transition-all duration-75"
          style={box}
        >
          <span className="absolute -top-6 left-0 max-w-[80vw] truncate rounded bg-sky-600 px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-white">
            {shown.name}
          </span>
        </div>
      )}

      {/* 수정 요청 입력창 */}
      {selected && (
        <div
          role="dialog"
          aria-label="구성요소 수정 요청"
          className="fixed inset-x-0 bottom-0 z-[9999] mx-auto w-full max-w-md rounded-t-2xl border border-zinc-200 bg-white p-4 text-left text-zinc-900 shadow-2xl sm:bottom-4 sm:rounded-2xl"
        >
          <p className="text-xs text-zinc-500">선택한 구성요소</p>
          <p className="font-semibold">{selected.name}</p>
          <p className="mb-3 font-mono text-xs text-zinc-500">{selected.file}</p>

          <label htmlFor="inspector-request" className="text-sm font-medium">
            어떻게 바꿀까요?
          </label>
          <textarea
            id="inspector-request"
            ref={textareaRef}
            value={request}
            onChange={(e) => {
              setRequest(e.target.value);
              setCopied("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onCopy();
            }}
            rows={3}
            placeholder="예: 카드 모서리를 더 둥글게 하고 배경을 연한 초록색으로"
            className="mt-1 w-full resize-none rounded-lg border border-zinc-300 p-2 text-sm focus:border-sky-500 focus:outline-none"
          />

          {copied === "ok" && (
            <p className="mt-2 text-sm text-emerald-700">
              ✓ 복사했어요. Claude 입력창에 붙여 넣고(Ctrl+V) 보내 주세요.
            </p>
          )}
          {copied === "fail" && (
            <p className="mt-2 text-sm text-red-600">
              복사에 실패했어요. 내용을 직접 선택해서 복사해 주세요.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setCopied("idle");
              }}
              className="min-h-11 flex-1 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-100"
            >
              다시 선택
            </button>
            <button
              type="button"
              onClick={onCopy}
              disabled={!request.trim()}
              className="min-h-11 flex-[2] rounded-full bg-sky-600 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-zinc-300"
            >
              프롬프트 복사
            </button>
          </div>
        </div>
      )}

      {/* 켜기/끄기 버튼 */}
      {!selected && (
        <button
          type="button"
          onClick={() => (active ? close() : setActive(true))}
          className={`fixed right-4 bottom-4 z-[9999] min-h-11 rounded-full px-4 text-sm font-medium shadow-lg ${
            active
              ? "bg-sky-600 text-white"
              : "bg-white text-zinc-900 ring-1 ring-zinc-200"
          }`}
        >
          {active ? "선택 중… (Esc 취소)" : "🎯 구성요소 선택"}
        </button>
      )}
    </div>
  );
}
