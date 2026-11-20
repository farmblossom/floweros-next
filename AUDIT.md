# 꽃폈네 OS — 코드·배포·보안 감사 보고서

**감사일:** 2026-11-20  
**감사 범위:** floweros-next 전체 (공개 URL·라우트·자산·인증·API)  
**기준 커밋:** 1d02131 (P0 완료)

---

## 1. 라우트 현황

| 경로 | 상태 | 비고 |
|------|------|------|
| `/` | ✅ 공개 정상 | 대문 (브랜드·농장 선택) |
| `/farm/deoksan` | ✅ P0 수정 완료 | async params → 404 해결 |
| `/farm/sinwol` | ✅ P0 수정 완료 | async params → 404 해결 |
| `/world/deoksan` | ✅ 공개 (3D WebGL) | Three.js R3F 렌더링 |
| `/world/sinwol` | ✅ 공개 (3D WebGL) | Three.js R3F 렌더링 |
| `/login` | ✅ P1 신규 | Google OAuth 로그인 (Supabase 설정 필요) |
| `/auth/callback` | ✅ P1 신규 | OAuth 콜백 처리 |
| `/unauthorized` | ✅ P1 신규 | 권한 없음 안내 |
| `/media-content` | ⚠️ P1 미들웨어 보호 추가 | Supabase 연동 후 실제 차단 |
| `/dashboard` 등 admin | ⚠️ P1 미들웨어 보호 추가 | UI만 존재, 기능 미구현 |

---

## 2. 브랜드 에셋 현황

| 에셋 | 경로 | 상태 |
|------|------|------|
| 꽃폈네 로고 | /assets/brand/logo-farm-blossom.png | ✅ 사용 중 (흰 배경) |
| FM 쩡이 | /assets/brand/fm-jeong-i.jpg | ✅ 사용 중 (흰 배경) |
| **쑤담이 단독 원본** | /assets/brand/ssudami-original.jpg | ✅ P0 고해상도 단독 원본 추가 |
| **퍼뜨기 단독 원본** | /assets/brand/putteogi-original.jpg | ✅ P0 고해상도 단독 원본 추가 |
| 커플 로고 | /assets/brand/logo-couple.png | ✅ 푸터 사용 |
| 브랜드 포스터 | /assets/brand/poster-brand.png | ✅ 히어로 사용 |
| 투명 배경 PNG | — | ❌ 미준비 (추후 사용자 제공) |

---

## 3. 인증·권한 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 관리자 미들웨어 | ✅ P1 코드 작성 | Supabase URL 설정 후 실제 차단 |
| Supabase 설치 | ✅ @supabase/supabase-js @supabase/ssr 설치됨 | |
| Supabase 연결 | ❌ 미연결 | .env.local 설정 필요 |
| Google OAuth | ❌ 미설정 | Google Console + Supabase 설정 필요 |
| RLS 정책 | ✅ schema.sql 작성됨 | Supabase에서 실행 필요 |
| 고객 인증 | ❌ 미구현 | P2 단계 |

**현재 상태:** 환경변수 없음 → 미들웨어가 모든 경로 통과 (guard 적용됨). Supabase 프로젝트 생성 + 환경변수 설정 후 실제 차단 활성화됨.

---

## 4. 데이터 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| DB 스키마 | ✅ supabase/schema.sql 작성 | Supabase SQL Editor에서 실행 필요 |
| 초기 시드 | ✅ supabase/seed.sql 작성 | 실행 필요 |
| 관리자 사진 CRUD | ❌ UI만 존재 | 실제 Supabase Storage 연동 P1-B |
| 날씨 API | ❌ DEMO 표시로 명확화 | 기상청 API 연동 P4 |
| 외부 채널 연동 | ❌ 미연동 | channels 테이블 준비됨, URL 등록 P1+ |
| 공식 공지 | ❌ 미구현 | announcements 테이블 준비됨 |

---

## 5. 완료 항목 이력

| 커밋 | 내용 |
|------|------|
| ede4209 | 사이드바 라우팅 |
| f8670ba | PC 테이블 텍스트 wrapping 수정 |
| ec86e24 | 모바일 반응형 사이드바 |
| 10eda80 | FlowerOS 대시보드 레이아웃 |
| bde3a02 | 원본 브랜드 에셋 적용 |
| d0b99e9 | Phase 1: 대문 + 독립 3D 두 농장 |
| 1d02131 | P0: 로고 링크·캐릭터 개별 이미지·farm 404 수정 |

---

## 6. P1 목표 및 완료 조건

| 항목 | 완료 조건 |
|------|-----------|
| Supabase 연결 | 환경변수 설정 후 `/login` → 로그인 성공 |
| admin 경로 보호 | 비로그인 시 `/login` 리다이렉트 확인 |
| 관리자 사진 CRUD | 업로드→승인→고객노출→삭제 후 새로고침 유지 |
| 공식 공지 | 작성→게시→대문 반영 확인 |

---

## 7. 필요한 외부 설정 (사용자 작업 필요)

1. **Supabase 프로젝트 생성** → `docs/supabase-setup.md` 참고
2. **Google OAuth 클라이언트 ID** 발급 → Google Console
3. **Vercel 환경변수** 추가 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAILS)
4. **schema.sql + seed.sql** Supabase SQL Editor에서 실행
5. **ADMIN_EMAILS** 환경변수에 FM 쩡이 Gmail 주소 입력
