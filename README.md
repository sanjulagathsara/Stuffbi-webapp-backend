---

## 🧾 Backend – `README.md` (StuffBi Webapp Backend)

```markdown
# StuffBi Web App – Backend

Backend API for the StuffBi web + mobile apps, built with **Node.js / Express** and **PostgreSQL**, deployed on **AWS EC2** with **RDS** and **NGINX + HTTPS**.

- API base URL (prod): https://apiofstuffbi.sanjulagathsara.com

This backend is **shared** between:
- Flutter mobile app
- Next.js web app (Vercel)

---

## Tech Stack

- Node.js + Express
- PostgreSQL on AWS RDS
- `pg` / `pg-pool` for DB
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- CORS for web + mobile clients
- NGINX reverse proxy
- Let’s Encrypt (Certbot) for HTTPS
- PM2 for process management
- GitHub Actions for auto-deploy to EC2

---

## Project Structure

```bash
src/
  server.js          # Express server bootstrap
  config/
    db.js            # Postgres pool config
  auth/
    auth.routes.js   # /auth endpoints (login, register)
    auth.controller.js
    auth.middleware.js # JWT validation
  items/
    item.routes.js   # /items endpoints
scripts/
  seedUser.js        # Seed initial user (test@example.com)
.env                 # Environment config (not committed)
Database Schema (Core Tables)
users
sql
Copy code
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
items
sql
Copy code
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  bundle_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
bundles (optional, if using bundles)
sql
Copy code
CREATE TABLE bundles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
Environment Variables (.env)
env
Copy code
PORT=4000

DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=your_db_password
DB_NAME=app_db

JWT_SECRET=supersecretlongkey
In production, .env lives on EC2 at /var/www/backend/.env.

Local Development
Install dependencies

bash
Copy code
npm install
Set up .env

bash
Copy code
cp .env.example .env   # if exists
# or create .env using the variables above
Run migrations / create tables

Use psql or any SQL client to create users, items, etc., as per schema.

Seed initial user

bash
Copy code
node scripts/seedUser.js
Default seeded user:

text
Copy code
email:    test@example.com
password: password123
role:     admin
Run dev server

bash
Copy code
npm run dev   # using nodemon
# or
node src/server.js
API will be at:

arduino
Copy code
http://localhost:4000
API Overview
Auth
POST /auth/login
Request:

json
Copy code
{
  "email": "test@example.com",
  "password": "password123"
}
Response:

json
Copy code
{
  "accessToken": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "admin"
  }
}
Items
GET /items (auth required)
Headers:

http
Copy code
Authorization: Bearer <accessToken>
Response:

json
Copy code
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Test Item",
    "subtitle": "Subtitle",
    "image_url": null,
    "bundle_id": null,
    "created_at": "2025-12-08T..."
  }
]
POST /items (auth required)
json
Copy code
{
  "title": "New item",
  "subtitle": "Optional subtitle",
  "imageUrl": "https://example.com/image.png",
  "bundleId": 1
}
CORS
CORS is configured to allow:

Local dev: http://localhost:3000 (Next.js)

Vercel: https://<your-vercel-project>.vercel.app

Flutter web / mobile origins as needed

In src/server.js:

js
Copy code
const allowedOrigins = [
  "http://localhost:3000",
  "https://stuffbi-webapp-frontend.vercel.app",
  // Add more origins if needed
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.log("Blocked by CORS:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
Deployment (Production)
Server
EC2 Ubuntu instance

Code location: /var/www/backend

Process manager: PM2

Start app:

bash
Copy code
pm2 start src/server.js --name backend
pm2 save
Logs:

bash
Copy code
pm2 logs backend
Reverse Proxy + SSL
NGINX forwarding:

nginx
Copy code
server {
    listen 80;
    server_name apiofstuffbi.sanjulagathsara.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
HTTPS with Certbot (Let’s Encrypt)

bash
Copy code
sudo certbot --nginx -d apiofstuffbi.sanjulagathsara.com
Resulting production URL:

text
Copy code
https://apiofstuffbi.sanjulagathsara.com
Auto-Deploy on Push (GitHub Actions → EC2)
A GitHub Actions workflow is configured so that pushes to main auto-deploy:

SSH into EC2

git pull

npm install

pm2 restart backend

Example workflow: .github/workflows/deploy.yml

yaml
Copy code
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: SSH & deploy to EC2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/backend
            git pull origin main
            npm install --production
            pm2 restart backend
Manual Deployment (Quick)
If you don’t want to wait for Actions or need a hotfix:

bash
Copy code
ssh ubuntu@<EC2_IP>
cd /var/www/backend
git pull origin main
npm install --production
pm2 restart backend
css
Copy code

If you want, I can also add a short “Architecture” diagram or a “How this connects to Flutter app” section to either README.
```

ssh to backend EC2

From keys folder -
ssh -i stuffbi.pem ubuntu@ec2-51-20-116-10.eu-north-1.compute.amazonaws.com
or //ssh -i stuffbi.pem ubuntu@51.20.116.10

go into directory - cd /var/www/backend
Check backend logs - pm2 logs backend

Access Database -
psql -h stuffbi-webapp-db.cze4seka6v7z.eu-north-1.rds.amazonaws.com \
 -U app_user \
 -d app_db

View tables - \dt

git fetch -

git fetch origin
git reset --hard origin/main

restart backend - pm2 restart backend --update-env

pm2 status
pm2 logs backend

# Add the sample SQL querries

---

## -- 1. DROP TABLES (order matters because of FK constraints)

DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

---

## -- 2. CREATE USERS TABLE

CREATE TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role VARCHAR(50) DEFAULT 'user',
created_at TIMESTAMP DEFAULT NOW()
);

---

## -- 3. CREATE PROFILES TABLE

CREATE TABLE profiles (
user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
display_name VARCHAR(255),
avatar_url TEXT,
phone VARCHAR(50),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

---

## -- 4. TRIGGER: AUTO-CREATE PROFILE ON USER CREATION

CREATE OR REPLACE FUNCTION create_default_profile()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO profiles (user_id, display_name, avatar_url, phone, created_at, updated_at)
VALUES (NEW.id, NULL, NULL, NULL, NOW(), NOW());
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_create_profile
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_profile();

------------------------------------------------------------
-- 5. CREATE BUNDLES TABLE
------------------------------------------------------------
CREATE TABLE bundles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

------------------------------------------------------------
-- 6. CREATE ITEMS TABLE
------------------------------------------------------------
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bundle_id INTEGER REFERENCES bundles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

------------------------------------------------------------
-- 7. CREATE ACTIVITY LOG TABLE
------------------------------------------------------------
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

------------------------------------------------------------
-- 8. INSERT ADMIN USER
------------------------------------------------------------
-- password: admin@123
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@gmail.com',
    '$2b$10$nXk7k2AqfN1nlbP8jZaV2eoM1htTFYA9ResvPbgCVImI.KJ.groupm',
    'admin'
);

------------------------------------------------------------
-- 9. UPDATE ADMIN PROFILE
------------------------------------------------------------
UPDATE profiles
SET
    display_name = 'Administrator',
    avatar_url = 'https://example.com/admin.png',
    phone = '+94710000000',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@gmail.com');

------------------------------------------------------------
-- 10. INSERT SAMPLE BUNDLES WITH IMAGES
------------------------------------------------------------
INSERT INTO bundles (user_id, title, subtitle, image_url)
VALUES
(1, 'Electronics', 'Gadgets and devices', 'https://cdn-icons-png.flaticon.com/512/1555/1555401.png'),
(1, 'Travel Gear', 'Things I take on trips', 'https://www.shutterstock.com/image-vector/backpack-icon-school-bag-vector-600nw-711514372.jpg'),
(1, 'Books', 'My reading list collection', 'https://upload.wikimedia.org/wikipedia/commons/0/06/Atomic_habits.jpg');

------------------------------------------------------------
-- 11. INSERT SAMPLE ITEMS WITH IMAGES
------------------------------------------------------------
INSERT INTO items (user_id, bundle_id, name, subtitle, image_url)
VALUES
(1, 1, 'MacBook Pro', '16-inch M1', 'https://cdn-icons-png.flaticon.com/512/22/22791.png'),
(1, 1, 'iPhone 14', '256GB Purple', 'https://wmstatic.global.ssl.fastly.net/ml/7170625-f-7b458377-aebf-4558-aa7c-e25f40d2a1ad.png'),
(1, 2, 'Backpack', 'Waterproof', 'https://www.shutterstock.com/image-vector/backpack-icon-school-bag-vector-600nw-711514372.jpg'),
(1, 3, 'Atomic Habits', 'James Clear', 'https://upload.wikimedia.org/wikipedia/commons/0/06/Atomic_habits.jpg');

------------------------------------------------------------
-- 12. INSERT SAMPLE ACTIVITY LOGS
------------------------------------------------------------
INSERT INTO activity_log (user_id, entity_type, entity_id, action, new_value)
VALUES
(1, 'bundle', 1, 'create', '{"title":"Electronics"}'),
(1, 'item', 1, 'create', '{"name":"MacBook Pro"}'),
(1, 'profile', 1, 'update', '{"display_name":"Administrator"}');

------------------------------------------------------------
-- DONE!
------------------------------------------------------------

SELECT 'Database reset + admin + sample bundles/items created successfully!' AS status;
$$
