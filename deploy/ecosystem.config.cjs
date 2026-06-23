module.exports = {
  apps: [{
    name: 'thedenimforge-api',
    cwd: './server',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
  }],
};
