module.exports = {
  apps: [
    {
      name: 'martabak-pos',
      script: './dist/server/entry.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        HOST: '0.0.0.0',
      },
    },
  ],
};

