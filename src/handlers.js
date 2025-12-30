// Message Processing Logic

import { sendMessage, sendTypingStatus } from "./api.js";
import { processImage } from "./ocr.js";
import { logger } from "./logger.js";

export async function handleTextMessage(chatId, text) {
  logger.telegram(`Text from ${chatId}: "${text}"`);

  // Handle commands
  if (text.startsWith("/")) {
    return handleCommand(chatId, text);
  }

  // Echo the message back
  const response = `You said: ${text}`;
  await sendMessage(chatId, response);
}

async function handleCommand(chatId, command) {
  const cmd = command.split(" ")[0].toLowerCase();

  switch (cmd) {
    case "/start":
      await sendMessage(
        chatId,
        "Welcome! I'm an Image-to-Text bot.\n\n" +
          "Send me any image and I'll extract text from it using AI.\n\n" +
          "Commands:\n" +
          "/help - Show available commands\n" +
          "/status - Check if I'm working"
      );
      break;

    case "/help":
      await sendMessage(
        chatId,
        "Available commands:\n\n" +
          "Send image - Extract text from image\n" +
          "Send text - I'll echo it back\n\n" +
          "Commands:\n" +
          "/start - Welcome message\n" +
          "/help - Show this message\n" +
          "/status - Check bot status"
      );
      break;

    case "/status":
      await sendMessage(chatId, "Bot is online and working!");
      break;

    default:
      await sendMessage(
        chatId,
        "Unknown command. Type /help for available commands."
      );
  }
}

export async function handlePhotoMessage(chatId, photo) {
  logger.image("Photo received, starting extraction...");

  await sendTypingStatus(chatId);
  await sendMessage(
    chatId,
    "Processing image, please wait...\n(This may take 10-30 seconds for large images)"
  );

  const largestPhoto = photo[photo.length - 1];
  const fileId = largestPhoto.file_id;

  const result = await processImage(fileId);
  if (!result) {
    await sendMessage(
      chatId,
      "Error: Could not process the image. Please try again."
    );
    return;
  }

  if (result.belowThreshold || result.confidence < 90) {
    await sendMessage(
      chatId,
      `Low confidence extraction: ${result.confidence}%\n\n` +
        "This image's text quality is below the 90% confidence threshold.\n\n" +
        "Possible reasons:\n" +
        "• Image is blurry or unclear\n" +
        "• Text is too small\n" +
        "• Poor lighting or contrast\n" +
        "• Text is damaged or distorted\n\n" +
        "Tip: Try a clearer image with better resolution and lighting."
    );
    return;
  }

  if (result.text.trim().length === 0) {
    await sendMessage(
      chatId,
      "No text found in image.\n\n" +
        "The image doesn't contain readable text, or the text is below the 90% quality threshold.\n\n" +
        "Possible reasons:\n" +
        "• Image contains only pictures/drawings\n" +
        "• Text is too faint or blurry\n" +
        "• Poor contrast\n" +
        "• Text is in a language other than English\n\n" +
        "Tip: Try a high-contrast image with clear, visible text."
    );
    return;
  }

  const confidenceLevel = result.confidence;
  const confidenceEmoji =
    confidenceLevel >= 95 ? "[OK]" : confidenceLevel >= 90 ? "[~]" : "[X]";

  const formattedResponse =
    `Extracted Text (90%+ Confidence)\n` +
    `${confidenceEmoji} Quality: ${confidenceLevel}%\n\n` +
    `${escapeHtml(result.text)}\n\n` +
    `Characters: ${result.characterCount}`;

  await sendMessage(chatId, formattedResponse);

  logger.success(`Text extraction complete for chat ${chatId}`);
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function processUpdate(update) {
  if (!update.message) {
    return;
  }

  const message = update.message;
  const chatId = message.chat.id;

  if (message.text) {
    await handleTextMessage(chatId, message.text);
  } else if (message.photo) {
    await handlePhotoMessage(chatId, message.photo);
  } else {
    await sendMessage(
      chatId,
      "Sorry, I only support text and images right now.\n\n" +
        "Try sending a text message or an image."
    );
  }
}
