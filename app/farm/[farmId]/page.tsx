import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ farmId: "deoksan" }, { farmId: "sinwol" }];
}

const farmData = {
  deoksan: {
    name: "밀양 덕산농장",
    location: "경남 밀양시 덕산리",
    area: "감자 고랑 40구획 (실증 준비)",
    status: "2027 봄감자 실증 운영 예정",
    statusType: "active" as const,
    description: "밀양 덕산리 실제 경작지를 기반으로 한 꽃폈네 1호 농장입니다. 수미·조풍 품종 봄감자를 40팀 고객과 함께 가꾸는 참여형 농장입니다.",
    details: [
      { icon: "grass", label: "재배 품종", value: "수미 · 조풍 봄감자 (고객 선택)" },
      { icon: "groups", label: "참여 규모", value: "40팀 고객 고랑 (2027 실증)" },
      { icon: "straighten", label: "고랑 구조", value: "A-01 ~ A-40 개별 고랑 배정" },
      { icon: "event", label: "운영 일정", value: "2027년 봄 시즌 (일정 확정 예정)" },
    ],
    notice: "2027년 실증을 위한 시뮬레이션 준비 중입니다. 실제 운영 조건·참여비·배송 정책은 확정 전 별도 안내됩니다.",
  },
  sinwol: {
    name: "신월리 농장",
    location: "경남 밀양시 초동면 신월리 98번지",
    area: "약 541평(0.18ha) · 계획관리지역",
    status: "과원 조성 준비 중",
    statusType: "preparing" as const,
    description: "밀양시 초동면 신월리 98번지 — 꽃폈네 2호 농장입니다. 면적 약 541평(0.18ha)의 계획관리지역으로, 북쪽이 높고 남쪽이 낮은 경사지입니다. 동쪽은 수림, 서쪽은 묘지 방향이며 중앙에 개간 구역과 일부 수림·사면을 포함합니다. 현재 과원 조성을 준비하는 단계로, 측량 및 드론 자료 확보 후 상세 계획을 수립할 예정입니다.",
    details: [
      { icon: "location_on", label: "소재지", value: "경남 밀양시 초동면 신월리 98번지" },
      { icon: "straighten", label: "부지 면적", value: "약 541평(0.18ha) · 계획관리지역 · 불규칙 필지" },
      { icon: "terrain", label: "지형 현황", value: "북쪽 높음 · 남쪽 낮음 · 동쪽 수림 · 서쪽 묘지 방향" },
      { icon: "eco", label: "조성 현황", value: "중앙 개간 구역 포함 · 수림·사면 일부 존재 · 과원 조성 준비 중" },
    ],
    notice: "신월리는 현재 과원 조성을 준비하는 단계입니다. 3D 화면은 임시 시뮬레이션 초안으로, 실제 측량·드론 자료 확보 후 정밀 업데이트할 예정입니다. 경사 각도·수목 수종·토양 분석 등 세부 항목은 현장 조사 완료 후 반영됩니다. 아직 확정되지 않은 참여 상품은 판매하지 않습니다.",
  },
};

export default async function FarmPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  const farm = farmData[farmId as keyof typeof farmData];
  if (!farm) notFound();

  const otherFarm = farmId === "deoksan"
    ? { id: "sinwol", name: "신월리 농장" }
    : { id: "deoksan", name: "밀양 덕산농장" };

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-8 h-14 flex items-center justify-between">
        <Link href="/" aria-label="꽃폈네 메인으로 이동" className="flex items-center gap-2">
          <Image
            src="/assets/brand/logo-farm-blossom.png"
            alt="꽃폈네"
            width={90}
            height={32}
            className="h-8 w-auto rounded-md"
          />
        </Link>
        <Link
          href={`/farm/${otherFarm.id}`}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          {otherFarm.name}
        </Link>
      </header>

      <div className={`h-52 md:h-72 flex items-end px-6 md:px-12 pb-8 ${
        farmId === "deoksan"
          ? "bg-gradient-to-br from-[#1e3a1e] via-[#2d5a2d] to-[#4a6243]"
          : "bg-gradient-to-br from-[#1a2e18] via-[#2a4a28] to-[#4a6243]"
      }`}>
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            farm.statusType === "active"
              ? "bg-green-400/20 text-green-300"
              : "bg-surface/20 text-white/80"
          }`}>
            {farm.statusType === "active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            )}
            {farm.status}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{farm.name}</h1>
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {farm.location} · {farm.area}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary-container/40 border border-secondary/20">
          <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0 mt-0.5">info</span>
          <p className="text-sm text-on-surface-variant">{farm.notice}</p>
        </div>

        <p className="text-on-surface">{farm.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {farm.details.map((d) => (
            <div key={d.label} className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">{d.icon}</span>
              <div>
                <div className="text-xs text-outline mb-0.5">{d.label}</div>
                <div className="font-semibold text-on-surface">{d.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/world/${farmId}`}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-on-primary font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-lg flex-1"
          >
            <span className="material-symbols-outlined text-[22px]">3d_rotation</span>
            3D 농장 탐방하기
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            대문으로
          </Link>
        </div>

        <div className="border-t border-outline-variant/30 pt-6">
          <p className="text-xs text-outline mb-3">다른 농장도 방문해보세요</p>
          <Link
            href={`/farm/${otherFarm.id}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[22px]">park</span>
            <span className="font-semibold text-on-surface">{otherFarm.name}</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-auto">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
