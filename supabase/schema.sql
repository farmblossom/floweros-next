-- ============================================================
-- 꽃폈네 OS — Supabase 초기 스키마 v1.1 (2026-11-20)
-- SQL Editor에 붙여넣기 후 Run하세요.
-- ============================================================

-- gen_random_uuid() — PostgreSQL 13+/Supabase 기본 지원. 별도 extension 불필요.

-- ============================================================
-- 1. 농장 (farms)
-- ============================================================
create table if not exists farms (
  id           text primary key,  -- 'deoksan' | 'sinwol'
  name         text not null,
  location     text,
  area         text,
  status       text not null default 'preparing',  -- 'active' | 'preparing' | 'closed'
  description  text,
  hero_image   text,  -- Supabase Storage 경로
  updated_at   timestamptz not null default now(),
  is_demo      boolean not null default true  -- true이면 공개 화면에 미노출
);

-- ============================================================
-- 2. 구역 (zones) — A구역, B구역 등
-- ============================================================
create table if not exists zones (
  id        text not null,
  farm_id   text not null references farms(id),
  name      text,
  primary key (id, farm_id)
);

-- ============================================================
-- 3. 고랑 (furrows) — A-01, A-02 등
-- ============================================================
create table if not exists furrows (
  id           text not null,
  zone_id      text not null,
  farm_id      text not null,
  crop         text,     -- '수미' | '조풍'
  status       text not null default 'available',  -- 'available' | 'assigned' | 'harvested'
  owner_alias  text,     -- 고객이 공개 동의한 경우에만 별칭 저장. 실명·연락처 절대 금지
  primary key (id, farm_id),
  foreign key (zone_id, farm_id) references zones(id, farm_id)
);

-- ============================================================
-- 4. 미디어 에셋 (media_assets)
-- ============================================================
create table if not exists media_assets (
  id              uuid primary key default gen_random_uuid(),
  farm_id         text references farms(id),
  furrow_id       text,  -- 고랑 연결 시 furrows.id (farm_id와 함께)
  category        text not null default 'general',  -- 'general' | 'growth' | 'harvest' | 'brand'
  storage_path    text not null,  -- Supabase Storage 경로 (farm-media 버킷)
  thumb_path      text,
  original_name   text,
  mime_type       text,
  size_bytes      bigint,
  captured_at     date,  -- 촬영일. EXIF 없으면 수기 입력
  description     text,
  visibility      text not null default 'admin',  -- 'public' | 'participant' | 'admin'
  approval_status text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  approved_by     uuid references auth.users(id),
  approved_at     timestamptz,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- 5. 영농일지 (field_logs)
-- ============================================================
create table if not exists field_logs (
  id              uuid primary key default gen_random_uuid(),
  farm_id         text not null references farms(id),
  furrow_id       text,
  happened_at     date not null,
  content         text not null,
  work_type       text,  -- '파종' | '관수' | '방제' | '수확' | '관측'
  media_ids       uuid[],  -- media_assets.id 배열
  visibility      text not null default 'admin',
  approval_status text not null default 'pending',
  created_by      uuid references auth.users(id),
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 6. 공식 공지 (announcements)
-- ============================================================
create table if not exists announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text not null,
  scope        text not null default 'public',  -- 'public' | 'deoksan' | 'sinwol' | 'participant'
  is_pinned    boolean not null default false,
  published_at timestamptz,
  status       text not null default 'draft',  -- 'draft' | 'published' | 'unpublished'
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 7. 모집 공고 (recruitments)
-- ============================================================
create table if not exists recruitments (
  id          uuid primary key default gen_random_uuid(),
  farm_id     text not null references farms(id),
  season      text not null,  -- '2027 봄감자'
  capacity    integer not null default 40,
  open_at     timestamptz,
  close_at    timestamptz,
  status      text not null default 'draft',  -- 'draft' | 'open' | 'closed' | 'full'
  description text,
  is_demo     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 8. 외부 채널 설정 (channels)
-- ============================================================
create table if not exists channels (
  id             uuid primary key default gen_random_uuid(),
  platform       text not null,  -- 'youtube' | 'instagram' | 'smartstore' | 'naver_blog' | 'band'
  display_name   text not null,
  url            text,  -- 관리자가 직접 입력. 추측·자동생성 금지
  channel_id     text,
  is_active      boolean not null default false,
  sync_mode      text not null default 'manual',  -- 'auto' | 'manual'
  last_synced_at timestamptz,
  sync_status    text,  -- 'ok' | 'error' | null
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- 9. 날씨 스냅샷 (weather_snapshots)
-- ============================================================
create table if not exists weather_snapshots (
  id          uuid primary key default gen_random_uuid(),
  farm_id     text not null references farms(id),
  source_type text not null,  -- 'kma_forecast' | 'kma_realtime' | 'fm_manual' | 'demo'
  issued_at   timestamptz,
  fetched_at  timestamptz not null default now(),
  is_stale    boolean not null default false,
  data        jsonb,
  error_msg   text
);

-- ============================================================
-- RLS 활성화 (Row Level Security)
-- ============================================================
alter table farms enable row level security;
alter table zones enable row level security;
alter table furrows enable row level security;
alter table media_assets enable row level security;
alter table field_logs enable row level security;
alter table announcements enable row level security;
alter table recruitments enable row level security;
alter table channels enable row level security;
alter table weather_snapshots enable row level security;

-- ============================================================
-- 공개(anon) 읽기 정책
-- ============================================================

-- 농장 기본 정보는 모두 공개
create policy "public_farms_read" on farms
  for select using (true);

-- 구역·고랑 번호는 공개 (owner_alias는 별칭만 저장되므로 공개 허용)
create policy "public_zones_read" on zones
  for select using (true);
create policy "public_furrows_read" on furrows
  for select using (true);

-- 미디어: 공개 승인·비데모 항목만 anon에게 노출
create policy "public_media_read" on media_assets
  for select using (
    visibility = 'public'
    and approval_status = 'approved'
    and is_demo = false
  );

-- 영농일지: 동일 조건
create policy "public_logs_read" on field_logs
  for select using (
    visibility = 'public'
    and approval_status = 'approved'
    and is_demo = false
  );

-- 공지: 발행된 public 공지만
create policy "public_announcements_read" on announcements
  for select using (
    status = 'published'
    and scope = 'public'
  );

-- 채널: 활성화된 채널만
create policy "public_channels_read" on channels
  for select using (is_active = true);

-- 날씨: 모두 공개 (출처·시간·stale 여부는 클라이언트에서 표시)
create policy "public_weather_read" on weather_snapshots
  for select using (true);

-- 모집: 공개 중인 비데모 모집만
create policy "public_recruitments_read" on recruitments
  for select using (
    status in ('open', 'closed', 'full')
    and is_demo = false
  );

-- ============================================================
-- 관리자 쓰기 정책 (service_role key → RLS 우회)
-- 실제 관리자 작업은 서버에서 service_role key로 수행하므로
-- 별도 authenticated 정책은 P2에서 추가 예정
-- ============================================================
