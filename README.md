# The Denim Forge

Premium wholesale jeans e-commerce platform by **CODEQUIP WEBTECH PRIVATE LIMITED**.

**Live Domain:** https://thedenimforge.com

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL

## Company Details

- **Company:** CODEQUIP WEBTECH PRIVATE LIMITED
- **Email:** codequipwebtech@gmail.com
- **Phone:** 8424939262
- **Address:** Shop No 22, Building Number 2, B Wing, Navkar Bahar, Ghanshyam Gupte Road, Vishnu Nagar, Dombivli West 421202

## Setup

```bash
npm run install:all
createdb thedenimforge
cp server/.env.example server/.env
npm run db:setup
npm run db:migrate --prefix server
npm run db:seed
npm run db:fix-images --prefix server
npm run dev
```

## Production (thedenimforge.com)

SERVER .env
```
DATABASE_URL=postgresql://user:pass@host:5432/thedenimforge
PORT=4000
JWT_SECRET=your_strong_random_secret_min_32_chars
CLIENT_URL=https://thedenimforge.com
SITE_URL=https://thedenimforge.com
```

### Client `.env`
```
VITE_SITE_URL=https://thedenimforge.com
VITE_API_URL=https://thedenimforge.com/api
```

Use Nginx (`deploy/nginx.conf`) to proxy `/api` → Node backend and `/` → React build.
Run API with PM2: `pm2 start deploy/ecosystem.config.cjs`

### Deploy steps (VPS)
```bash
# 1. Clone & install
git clone <repo> /var/www/thedenimforge && cd /var/www/thedenimforge
npm run install:all

# 2. Database
createdb thedenimforge
cp server/.env.example server/.env   # edit with production values
npm run db:setup && npm run db:migrate --prefix server
npm run db:seed --prefix server
npm run db:fix-images --prefix server

# 3. Build frontend (uses client/.env.production)
npm run build

# 4. Start API
pm2 start deploy/ecosystem.config.cjs && pm2 save

# 5. Nginx + SSL
sudo cp deploy/nginx.conf /etc/nginx/sites-available/thedenimforge.com
sudo ln -s /etc/nginx/sites-available/thedenimforge.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d thedenimforge.com -d www.thedenimforge.com
sudo nginx -t && sudo systemctl reload nginx
```

## Admin Panel

- **URL:** https://thedenimforge.com/admin
- **Email:** codequipwebtech@gmail.com
- **Password:** admin@denim2026

Features: Dashboard, Products CRUD, Orders management, Wholesale inquiries.

## Policy Pages

- `/terms` — Terms & Conditions
- `/privacy` — Privacy Policy
- `/shipping` — Shipping & Delivery
- `/refund` — Cancellation & Refund
- `/payment` — Fees & Payments
- `/wholesale-terms` — Wholesale Terms

## Images

Product, category & slider images are local JPGs in `client/public/images/`.
Run `npm run db:download-images --prefix server` then `npm run db:fix-images` to sync DB.
