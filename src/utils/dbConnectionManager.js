const log = require("smallog");

// Connecting and disconnecting from the database
const mongoose = require("mongoose");
const { loadEnvFile } = require("node:process");

try {
  loadEnvFile();
} catch (error) {
  log("No .env file detected!");
  if (process.env.NODE_ENV == "production") {
    log("No .env file - this is intentional!");
  }
}

async function dbConnect() {
  let dbUrl = process.env.DATABASE_URL;
  const url = new URL(dbUrl);
  log(`DB host: ${url.host}`);
  log("Connected");

  // workaround is to modify expected dns servers
  require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

  await mongoose.connect(dbUrl);
}

async function dbDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  dbConnect,
  dbDisconnect,
};
