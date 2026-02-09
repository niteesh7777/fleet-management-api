// PM2 ecosystem configuration for Fleet Management Backend
module.exports = {
  apps: [
    {
      name: 'fleet-backend',
      script: './src/server.js',
      instances: 1, // Can be set to 'max' for cluster mode
      exec_mode: 'fork', // Use 'cluster' for multiple instances
      watch: false, // Set to true for development, false for production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
};
