import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

console.log("🔍 Configuration Check:");
console.log(`✅ BOT_TOKEN found: ${TOKEN ? "YES" : "NO"}`);
console.log(`📍 API URL: ${API}`);

if (!TOKEN) {
  console.error("\n❌ ERROR: BOT_TOKEN not found in .env file!");
  console.error("Please create a .env file with: BOT_TOKEN=your_token_here");
  process.exit(1);
}

console.log("\n✅ Configuration is valid!");
console.log("The bot is ready to use.\n");
console.log("📝 Features:");
console.log("  • Receives text messages and echoes them back");
console.log("  • Receives images and extracts text using OCR");
console.log("  • Includes error handling with exponential backoff");
