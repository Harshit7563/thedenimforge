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

## server/.env (production example)
```env
DATABASE_URL=postgresql://denim:yourpass@localhost:5432/thedenimforge
PORT=4000
JWT_SECRET=change_this_to_a_long_random_string_32chars
CLIENT_URL=https://thedenimforge.com
SITE_URL=https://thedenimforge.com
```

## Update (future changes)
```bash
cd /var/www/thedenimforge
git pull
bash deploy/deploy.sh
```
