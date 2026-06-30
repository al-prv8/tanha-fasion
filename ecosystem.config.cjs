module.exports = {
  apps: [
    {
      name: "tanha-backend",
      cwd: "/root/tanha-fasion/server",
      script: "dist/index.js",
      instances: 9, // Run 9 instances in load-balanced cluster mode (4 existing + 5 more)
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "tanha-frontend",
      cwd: "/root/tanha-fasion",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
