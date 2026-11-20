# 꽃폈네 OS — Supabase + Google OAuth 설정 가이드

**대상:** FM 쩡이 (관리자)  
**기준일:** 2026-11-20  
**완료 후 동작:** `/login` → Google 로그인 → 관리자 화면 접근 가능

---

## 사전 준비

- Google 계정 (관리자용)
- Supabase 계정 (없으면 가입: https://supabase.com)
- Google Cloud Console 접근 (https://console.cloud.google.com)
- Vercel 대시보드 접근 (https://vercel.com/farmblossom/floweros-next)

---

## 1단계 — Supabase 프로젝트 생성 (5분)

1. https://supabase.com 로그인 → **New project** 클릭
2. Organization 선택 (또는 새로 만들기)
3. 프로젝트 정보 입력:
   - **Name:** `floweros`
   - **Database Password:** 강력한 비밀번호 입력 → 별도 기록 보관
   - **Region:** **Northeast Asia (Seoul)** 선택
4. **Create new project** 클릭 → 약 2분 대기

---

## 2단계 — 환경변수 복사 (3분)

1. Supabase 대시보드 → 왼쪽 메뉴 **Project Settings** → **Data API**
2. 다음 두 값을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` 에 사용
   - **Publishable API Key** (구 명칭: anon key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 에 사용
3. **Service Role Key** (Secret API Key 탭) → `SUPABASE_SERVICE_ROLE_KEY` 에 사용 (서버 전용, 절대 공개 금지)

### Vercel 환경변수 등록

1. https://vercel.com → floweros-next 프로젝트 → **Settings** → **Environment Variables**
2. 아래 4개 추가 (Environment: Production, Preview, Development 모두 체크):

| 변수 이름 | 값 |
|-----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` (Publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (Secret key — 절대 공개 금지) |
| `ADMIN_EMAILS` | FM 쩡이 Gmail 주소 (예: `fm@gmail.com`) |

3. 저장 후 **Redeploy** (Deployments 탭 → 최근 배포 → Redeploy)

---

## 3단계 — DB 스키마 실행 (3분)

1. Supabase 대시보드 → 왼쪽 메뉴 **SQL Editor**
2. **New snippet** 클릭
3. 아래 파일 내용 전체를 붙여넣기 → **Run** (Ctrl+Enter):
   - `supabase/schema.sql`
4. 성공 메시지 확인
5. 같은 방법으로 `supabase/seed.sql` 실행 (기초 데이터)
6. 왼쪽 **Table Editor**에서 `farms`, `channels` 등 테이블 생성 확인

---

## 4단계 — Google OAuth 설정 (10분)

### A. Google Cloud Console 설정

1. https://console.cloud.google.com 접속
2. 상단 프로젝트 선택기 → **새 프로젝트** (또는 기존 프로젝트 사용)
   - 프로젝트 이름: `floweros-auth`
3. 왼쪽 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
   - User Type: **외부(External)**
   - 앱 이름: `꽃폈네 OS`
   - 지원 이메일: FM 쩡이 Gmail
   - **저장 후 계속** (테스트 사용자 추가 단계까지 진행)
4. 왼쪽 메뉴 → **사용자 인증 정보** → **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: `floweros-next`
   - **승인된 리디렉션 URI** 추가:
     ```
     https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
     ```
     (`[YOUR_PROJECT_REF]`는 Supabase URL에서 복사)
5. **만들기** → **클라이언트 ID**, **클라이언트 보안 비밀번호** 복사

### B. Supabase Google Provider 활성화

1. Supabase 대시보드 → **Authentication** → **Sign In / Up** → **Google** 클릭
2. **Enable Sign In with Google** 토글 ON
3. 위에서 복사한 값 입력:
   - **Client ID (from Google):** `xxxx.apps.googleusercontent.com`
   - **Client Secret (from Google):** `GOCSPX-...`
4. **Save** 클릭

---

## 5단계 — Storage 버킷 생성 (2분)

1. Supabase → **Storage** → **New bucket**
2. 설정:
   - **Name:** `farm-media`
   - **Public bucket:** OFF (비공개 — 서버에서만 접근)
   - **File size limit:** 50 MB
3. **Save** 클릭

---

## 6단계 — 최종 테스트

Vercel Redeploy 완료 후:

| 테스트 | 예상 결과 |
|--------|-----------|
| `floweros-next.vercel.app/media-content` 비로그인 접근 | `/login`으로 리다이렉트 |
| `/login` → Google 로그인 → FM 쩡이 계정 | `/dashboard`로 이동 |
| `/login` → 등록되지 않은 Google 계정 | `/unauthorized`로 이동 |
| `floweros-next.vercel.app/` | 대문 정상 표시 (로그인 불필요) |

---

## 문제 해결

| 증상 | 확인 사항 |
|------|-----------|
| 로그인 후 `/dashboard` 대신 `/login`으로 돌아옴 | Vercel 환경변수 확인, Redeploy 했는지 확인 |
| `unauthorized` 페이지로 이동 | `ADMIN_EMAILS`에 로그인한 Gmail 주소가 정확히 입력됐는지 확인 |
| Google 로그인 버튼 클릭 후 오류 | Supabase Google Provider의 Client ID/Secret 재확인, 리디렉션 URI 확인 |
| `farm-media` 업로드 실패 | Storage 버킷 생성 여부 및 Service Role Key 환경변수 확인 |

---

## 보안 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트 코드에 절대 노출하지 마세요
- Google Cloud Console OAuth 동의화면을 "게시 완료"하기 전에 테스트 사용자로만 사용하세요
- `ADMIN_EMAILS`가 비어있으면 Google 로그인에 성공해도 모든 관리자 접근이 거부됩니다
