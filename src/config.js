// Configuration Management

import dotenv from "dotenv";

dotenv.config();

// Validate that required environment variables exist
function validateConfig() {
  const TOKEN = process.env.BOT_TOKEN;

  if (!TOKEN) {
    throw new Error(
      "FATAL: BOT_TOKEN not found in .env file. Please create .env with: BOT_TOKEN=your_token_here"
    );
  }

  return {
    TOKEN,
    API_URL: `https://api.telegram.org/bot${TOKEN}`,
    MAX_RETRIES: 5,
    INITIAL_RETRY_DELAY: 1000, // 1 second
    POLL_TIMEOUT: 30,
    MESSAGE_POLL_INTERVAL: 1000, // 1 second
  };
}

export const config = validateConfig();
