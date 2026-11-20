const navItems = [
  { icon: "space_dashboard", label: "대시보드", path: "dashboard" },
  { icon: "groups", label: "고객·참여 관리", path: "customer-participation" },
  { icon: "nature", label: "농장·고랑 관리", path: "farm-furrow" },
  { icon: "edit_note", label: "현장 영농일지", path: "field-journal" },
  { icon: "contact_support", label: "고객 요청", path: "customer-requests" },
  { icon: "local_shipping", label: "부분수확·배송", path: "harvest-delivery" },
  { icon: "perm_media", label: "미디어·콘텐츠 관리", path: "media-content", active: true },
  { icon: "auto_stories", label: "AI 초안·스토리북 검수", path: "ai-draft-storybook" },
  { icon: "hub", label: "외부 채널 관리", path: "channel-management" },
  { icon: "settings", label: "설정", path: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* 상단: 로고 + 네비게이션 */}
      <div className="flex flex-col gap-6">
        {/* 로고 영역 */}
        <div className="flex items-center gap-3 px-3">
          {/* 로고 플레이스홀더 (원본 이미지 미재생성) */}
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">yard</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary tracking-tight">꽃폈네 OS</span>
            <span className="font-label-sm text-label-sm text-secondary">FM 쩡이 관리자 센터</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.path}
                aria-current="page"
                className="flex items-center gap-3 px-3 py-2.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <a
                key={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </a>
            )
          )}
        </nav>
      </div>

      {/* 하단: 운영 모드 상태 */}
      <div className="px-3 py-3 rounded-lg bg-surface-container flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant">운영 모드</span>
          <span className="font-title-md text-title-md text-primary font-semibold">실시간 동기화 중</span>
        </div>
        <span className="material-symbols-outlined text-primary text-[20px]">sensors</span>
      </div>
    </aside>
  );
}
