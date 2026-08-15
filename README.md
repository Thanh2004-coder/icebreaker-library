# Game Warm-up

Thư viện **20 trò chơi** icebreaker / warm-up cho nhóm sinh viên.

Bất kỳ ai có URL đều có thể tìm trò, lọc, xem cách chơi và gửi review. **Không đăng nhập.**

Mục tiêu triển khai: khoảng **100 người** trong **14 ngày**, chi phí **$0** (free tier).

```text
Internet (Vercel Hobby URL)
        ↓
React frontend
        ↓  REST API
Java Spring Boot
        ↓  JPA / Hibernate
PostgreSQL
```

Node.js **không** dùng làm backend. npm/Vite chỉ để chạy và build React.

## 1. Project structure

```text
icebreaker-library/
├── backend/                 Java Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/warmup/library/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── domain/          entity
│       ├── dto/
│       ├── exception/
│       ├── config/
│       └── seed/            20 games
├── frontend/                React + Vite (deploy Vercel Hobby)
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── .gitignore
└── README.md
```

## 2. Cài Java

Cần **JDK 17+**.

```powershell
java -version
```

Đặt `JAVA_HOME` tới thư mục JDK 17.

## 3. Cài Node.js để chạy / build React

Cần Node.js 18+ **chỉ** cho frontend:

```powershell
node -v
npm -v
```

Không cài Express. Không chạy Node làm API.

## 4. Cài PostgreSQL local (development)

Cài PostgreSQL 15/16, service chạy cổng `5432`.

Không dùng MySQL.

## 5. Tạo database

psql hoặc pgAdmin:

```sql
CREATE DATABASE warmup_library;
```

Tùy chọn (Spring Boot `ddl-auto=update` cũng tự tạo bảng):

```sql
\c warmup_library
\i database/schema.sql
\i database/seed.sql
```

## 6. Chạy Spring Boot

Sao chép biến từ `backend/.env.example`. PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:DB_URL = "jdbc:postgresql://localhost:5432/warmup_library"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_postgres_password"
$env:CORS_ORIGINS = "http://localhost:5173"
cd backend
.\mvnw.cmd spring-boot:run
```

Hoặc mở `backend/pom.xml` trong IntelliJ và Run `WarmupLibraryApplication`.

API: http://localhost:8080/api/games  
Health: http://localhost:8080/api/health

## 7. Chạy React

```powershell
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173

Vite proxy `/api` → `http://localhost:8080` nên local **không cần** `VITE_API_URL`.

## 8. Seed 20 games

Lần đầu backend start, `DataSeeder` tự insert **20 trò** nếu bảng `games` trống.

Muốn seed lại:

```sql
TRUNCATE reviews, game_purposes, game_contexts, games RESTART IDENTITY CASCADE;
```

Rồi chạy lại Spring Boot.

## 9. Test REST API

```text
GET  /api/games?page=0&size=10
GET  /api/games?search=bingo&players=5&context=online&purpose=kickoff
GET  /api/games/1
GET  /api/games/1/reviews
POST /api/games/1/reviews
```

Ví dụ POST (không cần login):

```json
{
  "displayName": "Lan",
  "rating": 5,
  "comment": "Chơi với nhóm 5 người online rất nhẹ, không bị ép nói nhiều."
}
```

Validation: tên không rỗng (≤80), rating 1–5, comment không rỗng (≤1000).

Rating trung bình trên card được tính từ bảng `reviews`.

## 10. Push GitHub

```powershell
cd C:\Users\thanh\Downloads\icebreaker-library
git init
git add .
git commit -m "Add Game Warm-up React + Spring Boot + PostgreSQL"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Không commit file `.env` hay mật khẩu. `.gitignore` đã loại trừ.

## 11. Deploy PostgreSQL (free)

Dùng **PostgreSQL cloud**, không dùng MySQL.

Gợi ý free tier cho 14 ngày / ~100 người:

- [Neon](https://neon.tech) — PostgreSQL serverless, free tier. Chỉ dùng làm database, không dùng làm application backend.
- Render PostgreSQL (nếu còn free instance) hoặc Aiven trial.

Tạo database, copy host / user / password / db name.

JDBC URL dạng:

```text
jdbc:postgresql://HOST:5432/DATABASE?sslmode=require
```

## 12. Deploy backend Spring Boot (free)

Gợi ý: [Render](https://render.com) Web Service (free) hoặc [Railway](https://railway.app) trial / [Koyeb](https://www.koyeb.com).

**Render (khuyến nghị cho demo 14 ngày):**

1. New → Web Service → trỏ repo GitHub.
2. Root directory: `backend`
3. Runtime: Docker (`backend/Dockerfile`)
4. Instance: Free
5. Environment:

| Key | Value |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://...` |
| `DB_USERNAME` | user PostgreSQL |
| `DB_PASSWORD` | password PostgreSQL |
| `PORT` | `8080` (Render có thể tự gán `PORT`) |
| `CORS_ORIGINS` | URL Vercel, ví dụ `https://game-warmup.vercel.app` |

Lưu URL backend, ví dụ `https://warmup-api.onrender.com`.

Free Render ngủ sau ~15 phút idle. Đo thực tế: `/api/health` cold start có thể **20–135 giây**; khi warm thường dưới 1 giây. Workflow `.github/workflows/keep-render-awake.yml` ping `/api/health` mỗi 10 phút để giảm sleep (cần push GitHub + bật Actions).

## 13. Deploy frontend lên Vercel Hobby ($0)

1. [vercel.com](https://vercel.com) → Add New Project → chọn repo.
2. **Root Directory:** `frontend`
3. Framework: Vite
4. Build Command: `npm run build`
5. Output: `dist`
6. Environment variable **trước khi build**:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | URL Spring Boot, **không** có dấu `/` cuối. Ví dụ `https://warmup-api.onrender.com` |

7. Deploy. Plan: **Hobby**.

`frontend/vercel.json` đã cấu hình SPA rewrite cho React Router (`/games/:id`).

Sau khi có URL Vercel, quay lại Render và set `CORS_ORIGINS` đúng origin đó, rồi redeploy backend.

## 14. Environment variables

| Nơi | Biến |
| --- | --- |
| Backend | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT`, `CORS_ORIGINS` |
| Frontend build | `VITE_API_URL` |

Xem `.env.example`, `backend/.env.example`, `frontend/.env.example`.

Không hard-code password. Không hard-code localhost trong production (`CORS_ORIGINS` và `VITE_API_URL` phải là URL cloud).

## 15. URL website production

URL người dùng cuối là **URL Vercel Hobby**, ví dụ:

```text
https://game-warmup.vercel.app
```

Gửi link này cho nhóm. Không cần cài Java / Node / PostgreSQL.

Kiến trúc production:

```text
100 người bất kỳ
      ↓
Vercel Hobby  (React)
      ↓
Spring Boot   (Render / Koyeb)
      ↓
PostgreSQL    (Neon)
```

## REST API tóm tắt

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/api/games` | Search, filter, pagination (`page=0`, `size=10`) |
| GET | `/api/games/{id}` | Chi tiết + rating trung bình |
| GET | `/api/games/{id}/reviews` | Danh sách review |
| POST | `/api/games/{id}/reviews` | Gửi review (không login) |
| GET | `/api/filters` | Nhãn bộ lọc |
| GET | `/api/health` | Health check |

Query `GET /api/games`:

- `search` — tên, không phân biệt hoa thường, hỗ trợ không dấu
- `players` — `2`, `3-4`, `5`, `6-10`, `10+`
- `context` — slug, nhiều giá trị cách nhau bằng dấu phẩy (`online,warmup`)
- `purpose` — `meet`, `icebreak`, `laugh`, `interact`, `common`, `comfort`, `communicate`, `kickoff` (alias: `warmup` → `kickoff`)
- `duration` — `under-5`, `5-7`, `8-10`, `10-15`, `over-15`

## Chi phí $0 / 14 ngày

Không mua domain, VPS, database trả phí.

- Frontend: Vercel Hobby
- Backend: Render Free Web Service
- Database: Neon Free PostgreSQL

Nếu Render/Neon yêu cầu thẻ để xác minh, vẫn có thể ở free tier — không chọn paid plan.
