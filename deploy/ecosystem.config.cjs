const path = require('path');

const appRoot = path.join(__dirname, '..');
const logDir = path.join(appRoot, 'logs');

module.exports = {
  apps: [{
    name: 'thedenimforge-api',
    cwd: path.join(appRoot, 'server'),
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    min_uptime: '10s',
    max_restarts: 20,
    restart_delay: 4000,
    exp_backoff_restart_delay: 200,
    kill_timeout: 8000,
    listen_timeout: 15000,
    error_file: path.join(logDir, 'api-error.log'),
    out_file: path.join(logDir, 'api-out.log'),
    merge_logs: true,
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      UPLOAD_DIR: '/var/www/thedenimforge/uploads',
    },
  }],
};
