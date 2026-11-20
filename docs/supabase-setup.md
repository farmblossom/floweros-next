# Supabase 프로젝트 설정 가이드

## 1. Supabase 프로젝트 생성
1. https://supabase.com 로그인
2. New Project → 이름: `floweros`, 지역: ap-northeast-1 (도쿄, 한국과 가장 가까운 옵션)
3. Database Password 복사 보관 (관리자만)

## 2. 환경변수 설정

### 로컬 개발
1. `.env.example`을 복사해 `.env.local` 생성 (Git 커밋 금지)
2. Supabase 대시보드 → Project Settings → API에서 값 복사:
   - `NEXT_PUBLIC_SUPABASE_URL` ← Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` ← service_role key (비밀 보관)
3. `ADMIN_EMAILS`에 FM 쩡이 Gmail 주소 입력

### Vercel 배포
1. Vercel 대시보드 → floweros-next → Settings → Environment Variables
2. 위 환경변수 모두 추가 (Production + Preview + Development 체크)

## 3. 스키마 적용
1. Supabase 대시보드 → SQL Editor → New Query
2. `supabase/schema.sql` 전체 붙여넣기 → Run
3. `supabase/seed.sql` 전체 붙여넣기 → Run

## 4. Google OAuth 설정
1. https://console.cloud.google.com → 프로젝트 선택 또는 생성
2. API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 만들기
   - 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI 추가:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
3. Supabase 대시보드 → Authentication → Providers → Google
   - Client ID, Client Secret 입력 → Save

## 5. Storage 버킷 생성
1. Supabase 대시보드 → Storage → New Bucket
   - 이름: `farm-media`
   - Public: **false** (서버에서만 접근)
   - 파일 크기 제한: 50MB
   - 허용 MIME: image/jpeg, image/png, image/webp, video/mp4

## 6. 첫 관리자 등록
1. Vercel 환경변수 `ADMIN_EMAILS`에 FM 쩡이 Gmail 주소 추가
2. `/login` → Google로 로그인 → auth.users에 자동 등록
3. `/dashboard` 리다이렉트 확인

## 7. 연결 테스트 체크리스트
- [ ] `/login` → Google 로그인 → `/dashboard` 이동
- [ ] 미등록 계정 → `/unauthorized` 이동
- [ ] 비로그인 → `/media-content` → `/login` 리다이렉트
- [ ] Supabase 대시보드 → Table Editor → farms 테이블 2행 확인
- [ ] Supabase 대시보드 → Authentication → Users에 관리자 계정 등록 확인

## 8. 주의사항
- `.env.local`은 절대 Git 커밋하지 마세요
- service_role 키는 서버 환경변수에만 사용하고 클라이언트 코드에 넣지 마세요
- RLS 정책이 활성화되어 있으므로 테이블 직접 쿼리 시 service_role 클라이언트 사용 필요
