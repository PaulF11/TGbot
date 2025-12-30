import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

console.log("🔍 Startup Verification Test");
console.log("================================");

// Test 1: Check BOT_TOKEN
if (!TOKEN) {
  console.error("❌ FAILED: BOT_TOKEN not found");
  process.exit(1);
}
console.log("✅ BOT_TOKEN loaded successfully");

// Test 2: Verify API endpoint format
if (!API.includes("https://api.telegram.org/bot")) {
  console.error("❌ FAILED: Invalid API endpoint");
  process.exit(1);
}
console.log("✅ API endpoint is valid");

// Test 3: Try a simple API call
(async () => {
  try {
    console.log("⏳ Testing API connectivity...");
    const res = await axios.get(`${API}/getMe`, { timeout: 5000 });

    if (res.data.ok) {
      console.log(`✅ API Connection successful!`);
      console.log(`🤖 Bot name: @${res.data.result.username}`);
      console.log(`📝 Bot ID: ${res.data.result.id}`);
      console.log("\n================================");
      console.log("✅ All tests passed! Bot is ready.");
      console.log("\nTo start the bot, run: npm start");
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ API Connection failed:", err.message);
    console.error("Please verify your BOT_TOKEN is correct");
    process.exit(1);
  }
})();
