module.exports = {
  apps: [{
    name: 'banco-jota-backend',
    script: './server/start.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    restart_delay: 2000,
    max_restarts: 50,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    kill_timeout: 3000,
    wait_ready: false,
    listen_timeout: 5000
  }]
};
