// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "Docutrade QR Helper",
      script: "npm",
      args: "start",
      instances: "max", // or a specific number
      autorestart: true, // This is true by default
      watch: false, // Set to true to restart on file changes
    },
  ],
};
