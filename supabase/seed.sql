-- 꽃폈네 초기 데이터 (DEMO — 실제 운영 데이터 아님)
insert into farms (id, name, location, area, status, description, is_demo) values
  ('deoksan', '밀양 덕산농장', '경남 밀양시 덕산리', '감자 고랑 40구획 (실증 준비)', 'active',
   '밀양 덕산리 실제 경작지를 기반으로 한 꽃폈네 1호 농장', true),
  ('sinwol', '신월리 농장', '경남 밀양시 신월리', '약 541평 (과원 조성 예정지)', 'preparing',
   '밀양 신월리에 위치한 꽃폈네 2호 농장', true)
on conflict (id) do nothing;

insert into zones (id, farm_id, name) values
  ('A', 'deoksan', 'A구역'),
  ('B', 'deoksan', 'B구역')
on conflict (id, farm_id) do nothing;

insert into channels (platform, display_name, is_active, sync_mode) values
  ('youtube',      '꽃폈네 유튜브',       false, 'manual'),
  ('instagram',    '꽃폈네 인스타그램',   false, 'manual'),
  ('smartstore',   '꽃폈네 스마트스토어', false, 'manual'),
  ('naver_blog',   '꽃폈네 블로그',       false, 'manual'),
  ('band',         '꽃폈네 밴드',         false, 'manual')
on conflict do nothing;
