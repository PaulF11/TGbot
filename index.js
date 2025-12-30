// Bot Entry Point

import { config } from "./src/config.js";
import { logger } from "./src/logger.js";
import { getBotInfo } from "./src/api.js";
import { startPolling } from "./src/polling.js";

async function startup() {
  try {
    logger.info("Bot is starting up...");

    logger.success("Configuration loaded");

    logger.busy("Checking Telegram API connection...");
    const botInfo = await getBotInfo();

    if (!botInfo) {
      logger.error("Could not connect to Telegram API");
      logger.error("Please verify your BOT_TOKEN is correct");
      process.exit(1);
    }

    logger.success(`Connected! Bot: @${botInfo.username} (ID: ${botInfo.id})`);

    logger.info("");
    logger.info("Bot is listening for messages...");
    logger.info("Send it a message or photo to get started!");
    logger.info("");

    startPolling();
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

// Start the bot
startup();
