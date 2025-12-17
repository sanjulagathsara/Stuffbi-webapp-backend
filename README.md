---

## Backend – `README.md` (StuffBi Webapp Backend)

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

