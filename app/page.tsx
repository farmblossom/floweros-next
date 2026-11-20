"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const mediaItems = [
  {
    id: 1,
    name: "DKS_20270412_HERO_SPRING.jpg",
    info: "4.8 MB · 5472 × 3648 · Sony α7R V",
    farm: "밀양 덕산농장",
    area: "전체 들녘 (고랑 A·B 통합)",
    date: "2027-04-12 08:34",
    dateInfo: "GPS 메타 태깅됨",
    dateInfoColor: "text-primary",
    dateInfoIcon: "location_on",
    category: "homepage",
    categoryLabel: "홈페이지 대표",
    scope: "public",
    scopeLabel: "공개 웹사이트",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAExjyGJIIXZUQu0G77MQryfZv0FEe2xjnhrq1lChfHFt24-sFEPEj2bhvAw5pbOX7kOx-y0LQSX5H3--kk8qi0WryMrUowAJd2dntqjGd5khcY5vGuVDOXHYKye0zhGTHjfMMhP5-OJ7Paj6A1BE1K9XS4LJRVVouDqTw77RjXMjYMsVPs2MitgDKzJYn3Hhq_ivDdXZ79EygmQM8sh1bEPWY273Lkm6NxPL3Vv6s",
  },
  {
    id: 2,
    name: "FURROW_A04_SPROUT_01.jpg",
    info: "3.2 MB · 4032 × 3024 · iPhone 16 Pro",
    farm: "밀양 덕산농장",
    area: "A구역 04번 고랑 (김*진 고객)",
    areaColor: "text-secondary",
    date: "2027-04-11 14:15",
    dateInfo: "초장 18.5cm 기록 연동",
    dateInfoColor: "text-outline",
    category: "furrow",
    categoryLabel: "고객 고랑별 사진",
    scope: "customer",
    scopeLabel: "참여고객 전용",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHB3w0tDAaPY4aA3ifsyQsbMnbR8ASJO6ldq_YgH6_kewx2pywOs-VtGVx0T2xUay5psO0BoW6jWDl4qnPEHfVX5A4ihuAgNgjOh9GJxjeYYbNqJp_yiQGwFqQgetDYq7vK0-og1VbPZ0-qJ4Pn2eCDSdvNp8Msz-wgy946WyNlrmgnFzQRRD2syHhMKbGPJZT7ljVmDzfaPOEzduSuyP57iF5xK6YpHi-fUVYGBI",
  },
  {
    id: 3,
    name: "DKS_PANO_ENTRANCE_360.jpg",
    info: "12.4 MB · 7680 × 3840 · Insta360 Pro 2",
    farm: "밀양 덕산농장",
    area: "정문 입구 광장 (스팟 #1)",
    date: "2027-04-10 11:20",
    dateInfo: "FOV 360° Sphere",
    dateInfoColor: "text-outline",
    category: "vr360",
    categoryLabel: "360° 현장스팟",
    scope: "public",
    scopeLabel: "공개 웹사이트",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzIw6nDBmZVyUp_AF5Llh4Yeb25lVaMJ2AFjCKJ3P25suUNrzuqbjkhOYlmtmgGcEdjpwK-VSXtVm4jME6zYKy5vHfiuLZiZfH8d3GUUysYZU9u_qyOL44UUwWUqcPD_wexW-0IucNWGCsPl6-6dySx0AiqA4Cmql4r6i-P1TUhfNxym6vHIeQiUfsz8FkWrmN19ZS0E6uVK6WvhvzaTjkKYGZUzgIkRLTXLiZ8NY",
  },
  {
    id: 4,
    name: "DKS_DRONE_GRID_A_WEEK06.mp4",
    info: "84.6 MB · 4K 60fps · DJI Mavic 3 Pro",
    farm: "밀양 덕산농장",
    area: "A구역 전체 (01~40고랑)",
    date: "2027-04-09 09:40",
    dateInfo: "고도 30m 정점 비행",
    dateInfoColor: "text-primary",
    dateInfoIcon: "flight",
    category: "drone",
    categoryLabel: "농장 드론 뷰",
    scope: "public",
    scopeLabel: "공개 웹사이트",
    status: "approved",
    isVideo: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMT90ALpzVg9eUeywmM-DGviY3g6PmcCqpDgmfGLNZAu9mxH6yDPd4AzgOnBuyHl4qEvZIcCNxjV53MHbbW9Ry6lkalj_lsyU1D30-384d_vL_5hMpSD3CKKY8L-VDbjwsbBNzs-zFOSiUast60O5CJYAcs8pIq-cWEAW6cmBCYnXhw_Ncc8E4wuYYapcrIezWF0LKnFmOnNIf0bstH2fKWgBzpMh0sEbk5c3o2zE",
  },
  {
    id: 5,
    name: "PKG_2027_SAMPLE_FINAL_STORYBOOK.jpg",
    info: "6.1 MB · 4500 × 3000 · Canon EOS R5",
    farm: "밀양 패키징 스튜디오",
    area: "실물 스토리북 검수대",
    date: "2027-04-12 16:40",
    dateInfo: "조명 세팅: 3500K",
    dateInfoColor: "text-secondary",
    category: "package",
    categoryLabel: "수확·패키지",
    scope: "customer",
    scopeLabel: "참여고객 전용",
    status: "pending",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcdFPEyiH0QGZEYDa2IX4dNzcTS5n9HFGeqpw7ykrOvP5rfmAHO290FK4Lu3OXKhd3vwXXwaYUu39Bp_oc8Bj8CHliSQeyX_0krJBwZmOGJ1p4MQFH_zEdco88PkfKU7ehsPiEuZS3ARvXY69hRfPswK_f8Bwy72i2JhlYToaTCMLeB1OsgJS77rmVuWMW0d7-aD5QIptlepzBWEOKMM4oEpOlEWF-F8gvCm0aNgE",
  },
  {
    id: 6,
    name: "SOIL_EC_SENSOR_BOARD_CHECK.jpg",
    info: "2.1 MB · 3024 × 4032 · Galaxy S25",
    farm: "밀양 덕산농장",
    area: "B구역 센서 중계기 노드",
    date: "2027-04-08 17:10",
    dateInfo: "배터리 전압 4.1V 확인",
    dateInfoColor: "text-outline",
    category: "furrow",
    categoryLabel: "고객 고랑별 사진",
    scope: "internal",
    scopeLabel: "관리자 내부용",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsGQdEs8rhcz8LxQuN8nUlafi3J85ErFnZZY08usvAHzMZ7z-sOm2AbNoseWgJ_6Qvzmq_7xGm4pIO6HSKSiKzfDZVSMC1fCdvcM3y6wOGd5iijErvXZjwaA_UCeFN0JNNOYNi5MY44blFuoy56X3dUfiMgr0R50tz1LYTaOUWYOZavVC4HgHcM6dqQ5Cwc70lKVYFKNkSFupOrapnog_qq-61OWbzpJ_Z8HkGVEg",
  },
  {
    id: 7,
    name: "DKS_SUNSET_OVERVIEW_EXP.jpg",
    info: "7.4 MB · 5472 × 3648 · Mavic 3 Pro",
    farm: "밀양 덕산농장",
    area: "농장 전경 파노라믹 앵글",
    date: "2027-04-06 18:25",
    dateInfo: "골든아워 노출 보정완료",
    dateInfoColor: "text-outline",
    category: "drone",
    categoryLabel: "농장 드론 뷰",
    scope: "public",
    scopeLabel: "공개 웹사이트",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU3m1BX8K1GvgIaBgORNGqpHCYLSH7aO39TEuls1teFfMUgaNfcRZOBg6Yw0idbrQpTDAzjdMck1fWEbV8IFsdmuVmdSdWg41-bwMZNnpH_0mKtcmRdZv15KYyh_6QwjvmD7X86zsDZTOM-FtxzxuGCMntdEygIw0lDCna1VAq3hK5MhuOh7iW3E2TgpRb3CRWsbgQcnTEB4ooAOkULqVvGjoljrd9z4-Y5v1lA3k",
  },
  {
    id: 8,
    name: "FURROW_A12_SOIL_LOAM_DETAIL.jpg",
    info: "3.9 MB · 4032 × 3024 · iPhone 16 Pro",
    farm: "밀양 덕산농장",
    area: "A구역 12번 고랑 (박*훈 고객)",
    areaColor: "text-secondary",
    date: "2027-04-05 15:02",
    dateInfo: "배수 등급 최우수 점검",
    dateInfoColor: "text-outline",
    category: "furrow",
    categoryLabel: "고객 고랑별 사진",
    scope: "customer",
    scopeLabel: "참여고객 전용",
    status: "approved",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY7gjUZRpjozdrGeapSLR35l9JfxUz7Cxm0gIeT19z47JVTjOh7qZTKYeCw0_wb9M6PFdzL0jbsemB34T9pJK3ck5EF-K-S0uwgZH3A1fvGXbzupdoX6UhXQeYM7a9RQ0qrD7zYBQmwVrbwSzK55mUGmVxAQQcf48I0iw9LxhPAcf_f6vIwnx6eWGxbLOFyL5x2k_WpfdrY3GfbmZMYWLe2nOptlRNntjnvyKX9ig",
  },
];

const keySlots = [
  {
    label: "홈페이지 메인 대표",
    icon: "web",
    iconColor: "text-primary",
    id: "SLOT-01",
    statusLabel: "정상 노출 중",
    statusColor: "text-primary",
    statusDot: "bg-primary",
    title: "밀양 덕산리 봄 들녘 전경 (새싹 발아기)",
    desc: "꽃폈네 공식 웹 랜딩 최상단 히어로 배너에 노출 중인 고해상도 드론 원판입니다.",
    footer: "최종갱신: 2027.04.12 FM 쩡이",
    res: "1920 × 1080 (16:9)",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKJVDQBuLPEutAmI3bjXvqcibneV3iXe_zMuFjrPOoKZrGsMAJe-6PW8oooGtmJzZGhJZTpeRcluTXXFhKnrQDa4aHlHVlMaHRlird4m54-X89yWkaVTnnAUCLxXj7cSzBkY7TkI77zWXS488NRCHwvQnZV7X5B_nBIaVdMQaQE3-y6sNZQlSv-hN71LHzXwp7vF9OQ7p1dP7EUrad3ER_kD2vPVQdUISWSgqDbMw",
  },
  {
    label: "3D 가상농장 핫스팟",
    icon: "360",
    iconColor: "text-tertiary",
    id: "SLOT-02",
    statusLabel: "핫스팟 3개 연동",
    statusColor: "text-tertiary",
    statusDot: "bg-tertiary",
    title: "덕산농장 360° 파노라마 큐브맵",
    desc: "소비자가 내 고랑을 3차원으로 둘러보는 Three.js WebGL 투어 텍스처 데이터셋입니다.",
    footer: "해상도: 8K Panorama",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBN5Q5NsLWYCWOpniq7lEj3zbCDL2u6iNNF06-ZYQ_EPgJ1R4saSC0GhOG9FZvJEoEQPjjjPJqPoeVMu3ZNfgi0Fr6NMvZc360VzFWSu0zMvkFiSXhPcjWzDQU8A60bsmGTvt99C3dkx6IutRVb-qCTVvc150U8jqpb8u2-GMWUbdBlo3LNH_8jAv3XRXsvXF60IwxiCD8UhD3PQp2uZ9XCsCDjVKX5VZuUd5xXuwU",
    badges: ["입구", "중앙농로", "A구역"],
  },
  {
    label: "고랑별 실측 생육 슬롯",
    icon: "straighten",
    iconColor: "text-secondary",
    id: "SLOT-03",
    statusLabel: "EXIF 자동 매핑됨",
    statusColor: "text-primary",
    statusDot: "bg-primary",
    title: "고랑 A-04 실측 엽수 및 초장 기록",
    desc: "고객 모바일 알림톡 및 마이페이지 내 고랑 실시간 생육 갤러리에 공급됩니다.",
    footer: "실측 초장: 18.5 cm",
    res: "A-01 ~ A-40 연동",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX1lLY0IXjfWOz_y7tZHsp2gmvAQu2jp985GgGI926ee757BPRt3joxwK_dV8Zs4EpV3rUx6JnXaxQrkUiT45-pvQDrPDtyIv34qufku4gt98KZtul6mBc2wOQY_KTSbmsfpi081sCn31G5hvN47nY1OojxlwtFod_co7PhF0EvelIU7XDWaJh-RvGs4JkHYcIuE06-Obdida0N6F6ZxOd7ZF6kt65j5RpYSoh7vM",
  },
  {
    label: "수확 패키지 대표컷",
    icon: "inventory_2",
    iconColor: "text-on-secondary-container",
    bgLabel: "bg-secondary-container",
    id: "SLOT-04",
    statusLabel: "스토어/스토리북 연동",
    statusColor: "text-primary",
    statusDot: "bg-primary",
    title: "2027 햇감자 크라프트 패키지 3kg",
    desc: "퍼스기·쑤담이 캐릭터 인쇄본 및 리얼 감자 보증서가 포함된 패키징 최종 컷입니다.",
    footer: "최종 승인: FM 쩡이",
    res: "시즌 한정 3kg 상자",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbBP0WqL3bcx0k5_VjAxQ9Aqmd7l34Jif8v0_L7BXylXaU8_iyxqKYL0U_0P1FZ4bo4CRpg4cXinSBW0GB87xs-TnS-WtpSEnEGKRJnE90ACsJyzX181koOZFg2KChv93PxJThPUqURCfoj7v49LAmZ0uY8JzWuZmIrYNEqb3Cm2F3KJI7VEv48ggERqaX-33_MQmfeJt4i_UXGI5dIxY4TfjqpJA_U7vEscSm35Y",
  },
];

const catFilters = [
  { key: "all", label: "전체 (38)" },
  { key: "homepage", label: "홈페이지 대표 (4)" },
  { key: "drone", label: "농장 드론 뷰 (8)" },
  { key: "vr360", label: "360° 현장스팟 (6)" },
  { key: "furrow", label: "고객 고랑별 사진 (15)" },
  { key: "package", label: "수확·패키지 (5)" },
];

function ScopeChip({ scope, label }: { scope: string; label: string }) {
  if (scope === "public") {
    return (
      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit">
        <span className="material-symbols-outlined text-[14px]">public</span>
        {label}
      </span>
    );
  }
  if (scope === "customer") {
    return (
      <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit">
        <span className="material-symbols-outlined text-[14px]">lock</span>
        {label}
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit">
      <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
      {label}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        승인완료
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit">
      <span className="material-symbols-outlined text-[14px]">pending_actions</span>
      검수대기
    </span>
  );
}

export default function MediaContentPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [items, setItems] = useState(mediaItems);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const filteredItems = items.filter((item) => {
    const catMatch = activeCategory === "all" || item.category === activeCategory;
    const scopeMatch = scopeFilter === "all" || item.scope === scopeFilter;
    const searchMatch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && scopeMatch && searchMatch;
  });

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="pl-72">
        {/* 헤더 */}
        <Header />

        {/* 페이지 본문 */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">

            {/* Toast 알림 */}
            <div
              className={`fixed bottom-8 right-8 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 ${
                toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"
              }`}
            >
              <span className="material-symbols-outlined text-inverse-primary text-[20px]">check_circle</span>
              <span className="font-body-md text-body-md">{toastMsg}</span>
            </div>

            <div className="px-8 py-8 flex flex-col gap-8 max-w-[1440px] mx-auto w-full">

              {/* 상단 공지 & 헤더 정보 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>※ 본 화면의 모든 샘플 이미지는 2027년 실증을 위한 시뮬레이션 자료입니다.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-outline font-label-sm text-label-sm">
                      Cloudflare R2 + CDN 동기화 중
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-outline font-label-sm text-label-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>미디어 스토리지 잔여: 412.8 GB / 1.0 TB</span>
                  </div>
                </div>

                {/* 농장 탭 & 액션 툴바 */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                    <button className="px-4 py-2 rounded-lg font-title-md text-title-md bg-primary text-on-primary shadow-sm flex items-center gap-2 transition-all">
                      <span className="material-symbols-outlined text-[18px]">yard</span>
                      <span>밀양 덕산농장</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-on-primary/20 text-on-primary font-label-sm text-label-sm">활성</span>
                    </button>
                    <button className="px-4 py-2 rounded-lg font-title-md text-title-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">park</span>
                      <span>신월농장</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">과원 준비중</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95"
                      onClick={() => showToast("업로드 모달을 여는 기능은 준비 중입니다.")}
                    >
                      <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                      <span>신규 농장 사진/영상 등록</span>
                    </button>
                    <button
                      className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                      title="새로고침"
                      onClick={() => showToast("R2 스토리지 메타데이터를 전수 재동기화했습니다.")}
                    >
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 핵심 프론트 노출 슬롯 관리 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">핵심 프론트 노출 슬롯 관리</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      고객 웹사이트 메인 및 고랑 스토리북에 실시간 직결되는 4대 마스터 미디어 슬롯입니다.
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-3 py-1 rounded-full">
                    자동 캐시 무효화 적용됨
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {keySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="relative h-48 bg-surface-container overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={slot.img}
                          alt={slot.title}
                        />
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur-md ${slot.iconColor} font-label-sm text-label-sm shadow-sm flex items-center gap-1.5 ${slot.bgLabel ?? ""}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{slot.icon}</span>
                          {slot.label}
                        </span>
                        {slot.res && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-sm text-label-sm backdrop-blur-sm">
                            {slot.res}
                          </span>
                        )}
                        {slot.badges && (
                          <div className="absolute bottom-3 left-3 flex gap-1.5">
                            {slot.badges.map((b) => (
                              <span key={b} className="px-2 py-0.5 rounded bg-primary/90 text-on-primary font-label-sm text-label-sm backdrop-blur-sm">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-secondary font-semibold">{slot.id}</span>
                            <span className={`flex items-center gap-1 font-label-sm text-label-sm ${slot.statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${slot.statusDot}`}></span>
                              {slot.statusLabel}
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md text-on-surface font-semibold line-clamp-1">{slot.title}</h3>
                          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{slot.desc}</p>
                        </div>
                        <div className="pt-3 bg-surface-container-low/60 -mx-5 -mb-5 p-4 flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-outline">{slot.footer}</span>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5"
                            onClick={() => showToast(`${slot.title} 슬롯 교체를 시도합니다.`)}
                          >
                            <span className="material-symbols-outlined text-[16px]">sync</span>
                            교체
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 필터 & 검색 컨트롤 */}
              <div className="flex flex-col gap-4 bg-surface-container-low p-5 rounded-xl">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* 카테고리 필터 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-sm text-label-sm text-outline mr-2">사진 분류:</span>
                    {catFilters.map((f) => (
                      <button
                        key={f.key}
                        className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                          activeCategory === f.key
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant"
                        }`}
                        onClick={() => setActiveCategory(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* 범위 & 검색 */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-outline">visibility</span>
                      <span className="font-label-sm text-label-sm text-outline">공개 범위:</span>
                      <select
                        className="bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer"
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                      >
                        <option value="all">전체 범위</option>
                        <option value="public">공개 웹사이트 (Public)</option>
                        <option value="customer">참여고객 전용 (비공개)</option>
                        <option value="internal">관리자 내부용 (Internal)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-outline">search</span>
                      <input
                        className="bg-transparent font-label-md text-label-md text-on-surface placeholder:text-outline outline-none w-48 focus:w-64 transition-all"
                        placeholder="파일명, 구역(A-01), 태그 검색..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미디어 에셋 테이블 */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">농장 미디어 에셋 라이브러리</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      총 {filteredItems.length}개 표시 중
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-surface-container-high text-primary">
                      <span className="material-symbols-outlined text-[18px]">table_rows</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface text-outline hover:text-on-surface">
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">
                          <input className="w-4 h-4 rounded accent-primary cursor-pointer" type="checkbox" />
                        </th>
                        <th className="py-3 px-4">썸네일 / 에셋명</th>
                        <th className="py-3 px-4">촬영 농장 · 구역</th>
                        <th className="py-3 px-4">촬영일자 / EXIF</th>
                        <th className="py-3 px-4">콘텐츠 분류</th>
                        <th className="py-3 px-4">공개 범위</th>
                        <th className="py-3 px-4">승인 상태</th>
                        <th className="py-3 px-4 text-right">관리 액션</th>
                      </tr>
                    </thead>
                    <tbody className="text-on-surface font-body-md text-body-md">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input className="w-4 h-4 rounded accent-primary cursor-pointer" type="checkbox" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative group/thumb cursor-pointer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
                                <div className="absolute inset-0 bg-on-surface/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="material-symbols-outlined text-surface text-[18px]">
                                    {item.isVideo ? "play_circle" : "zoom_in"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-title-md text-title-md font-semibold text-on-surface truncate">{item.name}</span>
                                <span className="font-label-sm text-label-sm text-outline truncate">{item.info}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md font-semibold text-on-surface">{item.farm}</span>
                              <span className={`font-label-sm text-label-sm ${item.areaColor ?? "text-outline"} ${item.areaColor ? "font-medium" : ""}`}>
                                {item.area}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md text-on-surface">{item.date}</span>
                              <span className={`font-label-sm text-label-sm ${item.dateInfoColor} flex items-center gap-0.5`}>
                                {item.dateInfoIcon && (
                                  <span className="material-symbols-outlined text-[14px]">{item.dateInfoIcon}</span>
                                )}
                                {item.dateInfo}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                              {item.categoryLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <ScopeChip scope={item.scope} label={item.scopeLabel} />
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusChip status={item.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status === "pending" && (
                                <button
                                  className="px-2 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors"
                                  onClick={() => {
                                    setItems((prev) =>
                                      prev.map((i) => i.id === item.id ? { ...i, status: "approved" } : i)
                                    );
                                    showToast(`${item.name} 승인이 완료되었습니다.`);
                                  }}
                                >
                                  승인
                                </button>
                              )}
                              <button
                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                                title="파일 교체"
                                onClick={() => showToast(`${item.name} 파일 교체를 시도합니다.`)}
                              >
                                <span className="material-symbols-outlined text-[18px]">cached</span>
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                                title="원본 다운로드"
                                onClick={() => showToast(`${item.name} 원본 다운로드를 시작합니다.`)}
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-colors"
                                title="삭제"
                                onClick={() => {
                                  setItems((prev) => prev.filter((i) => i.id !== item.id));
                                  showToast(`${item.name}이(가) 삭제되었습니다.`);
                                }}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="p-4 bg-surface-container-low flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline">페이지 1 / 5 (총 38개 에셋 보관)</span>
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 rounded bg-surface text-outline hover:text-on-surface disabled:opacity-40" disabled>이전</button>
                    <button className="px-2.5 py-1 rounded bg-primary text-on-primary font-semibold">1</button>
                    <button className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface">2</button>
                    <button className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface">3</button>
                    <button className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface">4</button>
                    <button className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface">다음</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
