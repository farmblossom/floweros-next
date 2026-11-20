export default function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-8">
      {/* 왼쪽: 농장 선택 + 날씨 */}
      <div className="flex items-center gap-6">
        {/* 농장 선택 드롭다운 */}
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">agriculture</span>
          <select className="bg-transparent font-title-md text-title-md text-on-surface outline-none cursor-pointer pr-2">
            <option value="deoksan">밀양 덕산농장 (2027 봄감자 실증 중)</option>
            <option value="shinwol">신월농장 (과원 오픈 예정)</option>
          </select>
        </div>
        {/* 날씨 정보 */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">wb_sunny</span>
          <span>덕산농장: 21.4°C 맑음 (기상청 API 연동 예정 / FM 08:30 현장 육안 확인 완료)</span>
        </div>
      </div>

      {/* 오른쪽: 고객용 웹사이트 링크 + 사용자 프로필 */}
      <div className="flex items-center gap-4">
        <a
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="font-body-md text-body-md">고객용 웹사이트</span>
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
        <div className="h-6 w-px bg-outline-variant/40"></div>
        {/* 사용자 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="font-label-md text-label-md text-on-surface font-semibold">FM 쩡이</span>
            <span className="font-label-sm text-label-sm text-outline">총괄 농장관리자</span>
          </div>
          {/* 프로필 이미지 플레이스홀더 (원본 미재생성) */}
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
