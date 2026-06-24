# VPS Deploy Guide — The Denim Forge

## ⚠️ Error: `Directory 'server' does not exist`

Iska matlab **poora project upload nahi hua** — sirf `client` folder ya galat directory mein ho.

VPS par ye check karo:
```bash
cd /var/www/thedenimforge   # ya jahan unzip kiya
ls -la
# Ye folders DIKHNE CHAHIYE:
#   server/   client/   deploy/   database/   package.json
```

Agar `server/` nahi hai → poora ZIP dubara upload karo (neeche Option 2).

---

## Option 1: GitHub se (recommended)

### Mac par (ek baar)
```bash
cd /Users/harshit/thedenimforge
git init
git add .
git commit -m "Initial commit: The Denim Forge wholesale jeans store"
# GitHub par naya repo banao: thedenimforge
git remote add origin https://github.com/Harshit7563/thedenimforge.git
git branch -M main
git push -u origin main
```

### VPS par
```bash
# Prerequisites: Node 20+, PostgreSQL, Nginx, PM2
sudo apt update && sudo apt install -y nodejs npm postgresql nginx
sudo npm i -g pm2

# Clone
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/Harshit7563/thedenimforge.git
cd thedenimforge
sudo chown -R $USER:$USER .

# Environment
cp server/.env.example server/.env
nano server/.env   # DATABASE_URL, JWT_SECRET set karo

# Database
sudo -u postgres createdb thedenimforge
sudo -u postgres psql -c "CREATE USER denim WITH PASSWORD 'yourpass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE thedenimforge TO denim;"

# Deploy
chmod +x deploy/deploy.sh
bash deploy/deploy.sh

# Nginx + SSL
sudo cp deploy/nginx.conf /etc/nginx/sites-available/thedenimforge.com
sudo ln -sf /etc/nginx/sites-available/thedenimforge.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d thedenimforge.com -d www.thedenimforge.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## Option 2: Direct ZIP upload (SCP)

### Mac par ZIP banao (recommended)
```bash
cd /Users/harshit/thedenimforge
chmod +x deploy/package-for-vps.sh
bash deploy/package-for-vps.sh
```
File banegi: `~/thedenimforge-full.zip` — isme **server + client + deploy** sab hai.

### VPS par upload
```bash
scp ~/thedenimforge-full.zip user@YOUR_VPS_IP:/var/www/
ssh user@YOUR_VPS_IP
cd /var/www
unzip -o thedenimforge-full.zip
cd thedenimforge
ls server client deploy    # verify — server folder hona zaroori hai
cp server/.env.example server/.env
nano server/.env
bash deploy/deploy.sh
```

### Manual ZIP (alternative)
```bash
cd /Users/harshit
zip -r thedenimforge-full.zip thedenimforge \
  -x "*/node_modules/*" -x "*/dist/*" -x "*/.env" -x "*/.git/*"
```

---

## Domain DNS (Hostinger)

| Type | Name | Value |
|------|------|-------|
| A | `@` | VPS IP |
| A | `www` | VPS IP |

VPS IP: `curl -4 ifconfig.me`

---

## ⚠️ Port 5432 already in use (Docker / other project)

Agar `sudo ss -tlnp | grep 5432` par `docker-proxy` dikhe, matlab koi aur project (e.g. dyntra) PostgreSQL use kar raha hai.

**The Denim Forge alag port 5433 par chalao** — purana project band karne ki zaroorat nahi:

```bash
sudo systemctl start postgresql@16-main
sudo sed -i "s/^#*port = .*/port = 5433/" /etc/postgresql/16/main/postgresql.conf
sudo sed -i "s/^#*listen_addresses = .*/listen_addresses = 'localhost'/" /etc/postgresql/16/main/postgresql.conf
echo "host    all    all    127.0.0.1/32    scram-sha-256" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
sudo systemctl restart postgresql@16-main

sudo -u postgres psql -p 5433 <<'EOF'
CREATE USER denim WITH PASSWORD 'yourpass';
CREATE DATABASE thedenimforge OWNER denim;
GRANT ALL PRIVILEGES ON DATABASE thedenimforge TO denim;
EOF

PGPASSWORD='yourpass' psql -h 127.0.0.1 -p 5433 -U denim -d thedenimforge -c "SELECT 1;"
```

---

## server/.env (production example)

`localhost` ki jagah `127.0.0.1` use karo (IPv6 issues avoid):

```env
DATABASE_URL=postgresql://denim:yourpass@127.0.0.1:5433/thedenimforge
PORT=4000
JWT_SECRET=change_this_to_a_long_random_string_48chars
CLIENT_URL=https://thedenimforge.com
SITE_URL=https://thedenimforge.com
```

Sirf **5 lines** rakho — duplicate entries mat rakho.

---

## Full VPS deploy (fresh)

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/Harshit7563/thedenimforge.git
cd thedenimforge

cp server/.env.example server/.env
nano server/.env

chmod +x deploy/deploy.sh
bash deploy/deploy.sh

pm2 start deploy/ecosystem.config.cjs
pm2 save

# Nginx (HTTP pehle — SSL se pehle)
sudo cp deploy/nginx-http.conf /etc/nginx/sites-available/thedenimforge.com
sudo ln -sf /etc/nginx/sites-available/thedenimforge.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d thedenimforge.com -d www.thedenimforge.com
sudo cp deploy/nginx.conf /etc/nginx/sites-available/thedenimforge.com
sudo nginx -t && sudo systemctl reload nginx
```

**Admin:** https://thedenimforge.com/admin  
Email: `codequipwebtech@gmail.com` / Password: `admin@denim2026`

---

## Update (future changes)
```bash
cd /var/www/thedenimforge
git pull origin main
bash deploy/deploy.sh
pm2 restart thedenimforge-api
```
