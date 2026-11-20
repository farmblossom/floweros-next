-- ============================================================
-- 꽃폈네 OS — Supabase 초기 스키마
-- 버전: 2026-11-20 v1.0
-- ============================================================

create extension if not exists "uuid-ossp";

-- 1. 농장
create table if not exists farms (
  id           text primary key,  -- 'deoksan' | 'sinwol'
  name         text not null,
  location     text,
  area         text,
  status       text not null default 'preparing',
  description  text,
  hero_image   text,
  updated_at   timestamptz not null default now(),
  is_demo      boolean not null default true
);

-- 2. 구역
create table if not exists zones (
  id        text not null,
  farm_id   text not null references farms(id),
  name      text,
  primary key (id, farm_id)
);

-- 3. 고랑
create table if not exists furrows (
  id              text not null,
  zone_id         text not null,
  farm_id         text not null,
  crop            text,
  status          text not null default 'available',
  owner_alias     text,
  primary key (id, farm_id),
  foreign key (zone_id, farm_id) references zones(id, farm_id)
);

-- 4. 미디어 에셋
create table if not exists media_assets (
  id              uuid primary key default uuid_generate_v4(),
  farm_id         text references farms(id),
  furrow_id       text,
  category        text not null default 'general',
  storage_path    text not null,
  thumb_path      text,
  original_name   text,
  mime_type       text,
  size_bytes      bigint,
  captured_at     date,
  description     text,
  visibility      text not null default 'admin',
  approval_status text not null default 'pending',
  approved_by     uuid references auth.users(id),
  approved_at     timestamptz,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 5. 영농일지
create table if not exists field_logs (
  id              uuid primary key default uuid_generate_v4(),
  farm_id         text not null references farms(id),
  furrow_id       text,
  happened_at     date not null,
  content         text not null,
  work_type       text,
  media_ids       uuid[],
  visibility      text not null default 'admin',
  approval_status text not null default 'pending',
  created_by      uuid references auth.users(id),
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 6. 공식 공지
create table if not exists announcements (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  content      text not null,
  scope        text not null default 'public',
  is_pinned    boolean not null default false,
  published_at timestamptz,
  status       text not null default 'draft',
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 7. 모집 공고
create table if not exists recruitments (
  id          uuid primary key default uuid_generate_v4(),
  farm_id     text not null references farms(id),
  season      text not null,
  capacity    integer not null default 40,
  open_at     timestamptz,
  close_at    timestamptz,
  status      text not null default 'draft',
  description text,
  is_demo     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 8. 외부 채널
create table if not exists channels (
  id             uuid primary key default uuid_generate_v4(),
  platform       text not null,
  display_name   text not null,
  url            text,
  channel_id     text,
  is_active      boolean not null default false,
  sync_mode      text not null default 'manual',
  last_synced_at timestamptz,
  sync_status    text,
  updated_at     timestamptz not null default now()
);

-- 9. 날씨 스냅샷
create table if not exists weather_snapshots (
  id          uuid primary key default uuid_generate_v4(),
  farm_id     text not null references farms(id),
  source_type text not null,
  issued_at   timestamptz,
  fetched_at  timestamptz not null default now(),
  is_stale    boolean not null default false,
  data        jsonb,
  error_msg   text
);

-- ============================================================
-- RLS 활성화
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

-- 공개 읽기 정책
create policy "public_farms_read" on farms for select using (true);
create policy "public_zones_read" on zones for select using (true);
create policy "public_furrows_read" on furrows for select using (true);
create policy "public_media_read" on media_assets for select
  using (visibility = 'public' and approval_status = 'approved' and is_demo = false);
create policy "public_logs_read" on field_logs for select
  using (visibility = 'public' and approval_status = 'approved' and is_demo = false);
create policy "public_announcements_read" on announcements for select
  using (status = 'published' and scope = 'public');
create policy "public_channels_read" on channels for select
  using (is_active = true);
create policy "public_weather_read" on weather_snapshots for select using (true);
-- recruitments: 공개 모집만 노출
create policy "public_recruitments_read" on recruitments for select
  using (status in ('open', 'closed', 'full') and is_demo = false);
