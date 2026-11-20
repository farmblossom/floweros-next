interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-72 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 md:px-8 gap-3">
      {/* 햄버거 버튼 (모바일/태블릿) */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant flex-shrink-0"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* 왼쪽: 농장 선택 + 날씨 */}
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        {/* 농장 선택 드롭다운 */}
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface min-w-0">
          <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0">agriculture</span>
          <select className="bg-transparent font-title-md text-title-md text-on-surface outline-none cursor-pointer truncate max-w-[180px] md:max-w-none">
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
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <a
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="font-body-md text-body-md">고객용 웹사이트</span>
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
        <div className="hidden md:block h-6 w-px bg-outline-variant/40"></div>
        {/* 사용자 정보 */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-label-md text-label-md text-on-surface font-semibold">FM 쩡이</span>
            <span className="font-label-sm text-label-sm text-outline">총괄 농장관리자</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
