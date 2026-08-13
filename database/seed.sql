-- Seed tags. 20 games are upserted by Spring Boot DataSeeder on startup.

INSERT INTO contexts (slug, name) VALUES
  ('classroom', 'Trong lớp học'),
  ('indoor', 'Trong phòng'),
  ('outdoor', 'Ngoài trời'),
  ('campus', 'Campus'),
  ('small-group', 'Nhóm nhỏ')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO purposes (slug, name) VALUES
  ('meet', 'Làm quen'),
  ('icebreak', 'Phá băng'),
  ('laugh', 'Tạo tiếng cười'),
  ('interact', 'Tăng tương tác'),
  ('common', 'Tìm điểm chung'),
  ('comfort', 'Tạo sự thoải mái'),
  ('communicate', 'Giao tiếp'),
  ('kickoff', 'Khởi động trước khi họp nhóm')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
