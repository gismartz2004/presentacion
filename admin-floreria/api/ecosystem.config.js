module.exports = {
  apps: [
    {
      name: "admin-perfumeria-api",
      script: "./src/index.js",
      instances: process.env.NODE_ENV === "production" ? "max" : 1,
      exec_mode: "cluster",

      env: {
        NODE_ENV: "development",
        PORT: 4002,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4002,
      },

      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      // merge_logs: true, // Unir logs de todas las instancias

      // autorestart: true, // Reiniciar automáticamente si la aplicación falla
      watch: false, // Desactivar watch para evitar reinicios innecesarios
      max_memory_restart: "3G", // Reiniciar si usa más de 3GB de RAM
      min_uptime: "10s", // Tiempo mínimo para considerar que la app está estable
      max_restarts: 10, // Número máximo de reinicios en el período de tiempo definido por min_uptime
      kill_timeout: 5000, // 5 segundos
      listen_timeout: 3000, // 3 segundos
    },
  ],
};
