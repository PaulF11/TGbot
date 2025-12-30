// Telegram API Wrapper

import axios from "axios";
import { logger } from "./logger.js";
import { config } from "./config.js";

export async function sendMessage(chatId, message) {
  try {
    await axios.post(`${config.API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML", // Allows HTML formatting like <b>bold</b>
    });
    logger.telegram(`Message sent to ${chatId}`);
    return true;
  } catch (err) {
    logger.error(
      `Failed to send message: ${err.response?.data || err.message}`
    );
    return false;
  }
}

export async function sendTypingStatus(chatId) {
  try {
    await axios.post(`${config.API_URL}/sendChatAction`, {
      chat_id: chatId,
      action: "typing",
    });
  } catch (err) {
    // Non-critical, don't log errors
  }
}

export async function getBotInfo() {
  try {
    const res = await axios.get(`${config.API_URL}/getMe`, {
      timeout: 5000,
    });

    if (res.data.ok) {
      return res.data.result;
    }
    return null;
  } catch (err) {
    logger.error(`Failed to get bot info: ${err.message}`);
    return null;
  }
}

export async function getUpdates(offset, timeout = config.POLL_TIMEOUT) {
  try {
    const res = await axios.get(`${config.API_URL}/getUpdates`, {
      params: { offset, timeout },
      timeout: timeout * 1000 + 5000, // Add 5 seconds buffer to server timeout
    });

    return res.data.result || [];
  } catch (err) {
    logger.error(`API Error: ${err.response?.data || err.message}`);
    throw err;
  }
}
