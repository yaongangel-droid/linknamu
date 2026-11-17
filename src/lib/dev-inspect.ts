/**
 * 개발 화면에서 구성요소를 클릭해 수정 요청을 만들 수 있도록 표시를 붙입니다.
 * 배포(production) 화면에는 아무 속성도 붙지 않습니다.
 *
 * 사용법: <div {...inspect("ProfileHeader", "src/components/ProfileHeader.tsx")}>
 */
export function inspect(name: string, file: string) {
  if (process.env.NODE_ENV !== "development") return {};
  return { "data-component": name, "data-file": file };
}
