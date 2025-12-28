import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;

console.log("🤖 Bot is listening...");

async function poll() {
  try {
    const res = await axios.get(`${API}/getUpdates`, {
      params: { offset, timeout: 30 },
    });

    for (const update of res.data.result) {
      offset = update.update_id + 1;

      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        console.log("📩", text);

        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: `You said: ${text}`,
        });
      }
    }
  } catch (err) {
    console.error("❌", err.response?.data || err.message);
  }

  setTimeout(poll, 1000);
}

poll();
