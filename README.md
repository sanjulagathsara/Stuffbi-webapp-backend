````markdown
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

---

## Project Structure

```bash
src/
  server.js
  config/
  auth/
  items/
  bundles/
  profile/
  sync/
.env                 # Environment config (not committed)
```

## How to Run

```bash
# Install dependencies
npm install

# Set up .env file with database credentials and JWT secret
cp .env.example .env

# Start development server
npm run dev

# Or start with PM2 (production)
pm2 start src/server.js --name "stuffbi-api"
```

**Requirements:**

- Node.js v16+
- PostgreSQL running locally or AWS RDS credentials in `.env`
- Port 3000 (or configured in `.env`)
````
