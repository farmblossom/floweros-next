import type { FarmId } from "./terrain";

import type { NpcKind } from "./NpcCharacter";

export interface FarmNpc {
  id: string;
  kind: NpcKind;
  name: string;
  role: string;
  textureUrl: string;
  /** x, z 좌표 (지형 높이는 씬에서 계산) */
  xz: [number, number];
  lines: string[];
  height: number;
  greetRadius: number;
  accent: string;
  /** 메인 캐릭터(퍼뜨기·쑤담이)는 조금 더 크게 */
  main?: boolean;
}

const CHARS = "/assets/brand/chars";

export const FARM_NPCS: Record<FarmId, FarmNpc[]> = {
  sinwol: [
    {
      id: "putteogi",
      kind: "putteogi",
      name: "퍼뜨기",
      role: "신월농장 메인 지기",
      textureUrl: `${CHARS}/putteogi.png`,
      xz: [-1.5, 3.5],
      height: 2.35,
      greetRadius: 4.2,
      accent: "#3f6b34",
      main: true,
      lines: [
        "안녕하세요! 신월리 98번지 0.18ha 개간 현장이에요 🌿",
        "남서향 경사 10~15도 — 일조 좋은 과수 명당이에요 ☀️",
        "임지생산능력 Ⅱ급지, 밤나무 재배 최적지래요 🌰",
        "동쪽엔 자두 유목, 남쪽엔 호밀밭을 함께 가꾸고 있어요",
        "궁금한 구획을 클릭하거나 가까이 다가와 보세요!",
      ],
    },
    {
      id: "ssudami",
      kind: "ssudami",
      name: "쑤담이",
      role: "신월농장 안내 지기",
      textureUrl: `${CHARS}/ssudami.png`,
      xz: [-8.4, 5.0],
      height: 2.3,
      greetRadius: 4.0,
      accent: "#4a6243",
      main: true,
      lines: [
        "신월농장에 오신 걸 환영해요! 제가 입구에서 안내할게요 😊",
        "서쪽 접근로로 들어오면 개간지가 한눈에 보여요",
        "호밀은 땅을 살리는 녹비작물이라 사이갈이로 키우고 있어요 🌾",
        "자두 유목은 2~3년 뒤 첫 열매를 목표로 자라는 중이에요",
      ],
    },
    {
      id: "dangoma",
      kind: "dangoma",
      name: "당고매",
      role: "원물 고구마 지기",
      textureUrl: `${CHARS}/dangoma.png`,
      xz: [4.6, 8.6],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#a05f4a",
      lines: [
        "저는 당고매예요. 밭에서 갓 캐낸 원물 고구마 담당이에요 🍠",
        "흙 묻은 그대로가 제 매력 — 수확한 생고구마 그 자체예요",
        "오늘은 겉흙이 촉촉하고 잘 부슬부슬해서 캐기 좋은 날이에요",
      ],
    },
    {
      id: "kkuloma",
      kind: "kkuloma",
      name: "꿀고매",
      role: "찐·군고구마 지기",
      textureUrl: `${CHARS}/kkuloma.png`,
      xz: [6.4, 1.2],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#b08422",
      lines: [
        "꿀고매예요! 쪄지거나 구워져 달콤해진 고구마 담당이에요 🍯",
        "군고구마는 껍질이 쫀득해질 때까지 천천히 구워요",
        "찐고구마는 쪄서 하루 숙성하면 더 달아진답니다",
      ],
    },
    {
      id: "jjongoma",
      kind: "jjongoma",
      name: "쫀고매",
      role: "말랭이 가공 지기",
      textureUrl: `${CHARS}/jjongoma.png`,
      xz: [2.6, -3.2],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#8a6d1f",
      lines: [
        "쫀고매예요. 고구마를 말랭이로 가공하는 일을 맡고 있어요 🍠",
        "잘 익힌 고구마를 말랑하게 말리면 쫀득한 말랭이가 돼요",
        "건조대를 하루 두 번 뒤집어 주는 게 제 일과예요",
      ],
    },
    {
      id: "fm-jjeongi",
      kind: "fm",
      name: "FM 쩡이",
      role: "총괄 농장관리자",
      textureUrl: `${CHARS}/fm-jjeongi.png`,
      xz: [-11.2, 6.6],
      height: 2.35,
      greetRadius: 3.6,
      accent: "#2f5d7c",
      lines: [
        "어서 오세요, 신월농장입니다. 제가 총괄 관리를 맡고 있어요 🌱",
        "지금 신월은 개간지 · 자두 유목 · 호밀밭 세 구역으로 나눠 관리 중이에요",
        "궁금한 건 저나 다섯 지기에게 편하게 물어보세요",
      ],
    },
  ],
  deoksan: [
    {
      id: "ssudami",
      kind: "ssudami",
      name: "쑤담이",
      role: "덕산농장 메인 지기",
      textureUrl: `${CHARS}/ssudami.png`,
      xz: [0, 1.5],
      height: 2.35,
      greetRadius: 4.2,
      accent: "#3f6b34",
      main: true,
      lines: [
        "안녕하세요! 덕산리 756번지 감자밭이에요 🥔",
        "2027년 봄 수미·조풍 품종 실증을 준비 중이에요",
        "고랑 A-01~A-40까지 40구획이 있어요. 각 팀이 한 구획씩 맡아요",
        "감자가 발아하고 꽃이 피는 과정을 함께 지켜봐요!",
      ],
    },
    {
      id: "putteogi",
      kind: "putteogi",
      name: "퍼뜨기",
      role: "덕산농장 입구 지기",
      textureUrl: `${CHARS}/putteogi.png`,
      xz: [2.4, 10.4],
      height: 2.3,
      greetRadius: 4.0,
      accent: "#4a6243",
      main: true,
      lines: [
        "덕산농장 입구예요. 잠시 들러 안내 받고 들어가세요!",
        "왼쪽에 창고, 오른쪽에 경운기가 보여요",
        "고랑 사이 농로를 따라 걸으면 구획 번호를 확인할 수 있어요",
      ],
    },
    {
      id: "dangoma",
      kind: "dangoma",
      name: "당고매",
      role: "원물 수확 지기",
      textureUrl: `${CHARS}/dangoma.png`,
      xz: [-5.2, 4.2],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#a05f4a",
      lines: [
        "제가 맡은 건 밭에서 갓 캐낸 원물이에요 — 흙 묻은 생고구마·생감자요 🍠",
        "오늘은 고랑 A-12 옆에서 막 캐낸 걸 정리했어요",
        "껍질에 흠집이 적은 게 좋은 원물이에요",
      ],
    },
    {
      id: "kkuloma",
      kind: "kkuloma",
      name: "꿀고매",
      role: "찐·군고구마 지기",
      textureUrl: `${CHARS}/kkuloma.png`,
      xz: [-10.6, -6.6],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#b08422",
      lines: [
        "캐낸 고구마를 쪄서, 구워서 달콤하게 만드는 게 제 일이에요 🍯",
        "창고 옆 화로에서 방금 군고구마를 꺼냈어요",
        "따끈할 때 먹어야 꿀이 흐른답니다",
      ],
    },
    {
      id: "jjongoma",
      kind: "jjongoma",
      name: "쫀고매",
      role: "말랭이 가공 지기",
      textureUrl: `${CHARS}/jjongoma.png`,
      xz: [-3.6, -8.8],
      height: 1.95,
      greetRadius: 3.6,
      accent: "#8a6d1f",
      lines: [
        "쫀득한 말랭이는 건조대에서 완성돼요 🍠",
        "차광막 그늘에서 천천히 말리면 단맛이 진해져요",
        "바람 좋은 날엔 하루 만에 쫀득해지기도 해요",
      ],
    },
    {
      id: "fm-jjeongi",
      kind: "fm",
      name: "FM 쩡이",
      role: "총괄 농장관리자",
      textureUrl: `${CHARS}/fm-jjeongi.png`,
      xz: [-2.2, 11.4],
      height: 2.35,
      greetRadius: 3.6,
      accent: "#2f5d7c",
      lines: [
        "어서 오세요, 덕산농장입니다. 총괄 관리자 FM 쩡이예요 🌱",
        "이번 주는 40구획 토양 수분 점검 주간이에요",
        "지기들이 밭 곳곳에 있으니 궁금한 구획을 물어보세요",
      ],
    },
  ],
};
