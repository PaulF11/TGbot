// Optical Character Recognition - Image to Text

import axios from "axios";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { logger } from "./logger.js";
import { config } from "./config.js";

// Create temp directory if it doesn't exist
const TEMP_DIR = path.join(process.cwd(), "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

export async function downloadImageFromTelegram(fileId) {
  try {
    logger.busy("Downloading image from Telegram...");

    const fileRes = await axios.get(`${config.API_URL}/getFile`, {
      params: { file_id: fileId },
    });

    const filePath = fileRes.data.result.file_path;
    logger.debug(`File path: ${filePath}`);

    const fileUrl = `https://api.telegram.org/file/bot${config.TOKEN}/${filePath}`;

    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const tempFile = path.join(TEMP_DIR, `img_${Date.now()}.png`);
    fs.writeFileSync(tempFile, response.data);

    logger.success(`Image downloaded: ${tempFile}`);
    return tempFile;
  } catch (err) {
    logger.error(`Failed to download image: ${err.message}`);
    return null;
  }
}

function normalizeExtractedText(text) {
  return (
    text
      // Remove leading/trailing whitespace from each line
      .split("\n")
      .map((line) => line.trim())
      // Remove empty lines
      .filter((line) => line.length > 0)
      // Join back with single newlines
      .join("\n")
      // Replace multiple spaces with single space
      .replace(/\s{2,}/g, " ")
      // Trim the final result
      .trim()
  );
}

export async function extractTextFromImage(imagePath) {
  try {
    logger.image("Processing image with Tesseract OCR...");

    logger.busy("Running OCR analysis...");
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const percentage = Math.round(m.progress * 100);
          logger.debug(`   OCR progress: ${percentage}%`);
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    const CONFIDENCE_THRESHOLD = 90;
    if (confidence < CONFIDENCE_THRESHOLD) {
      logger.warn(`Low confidence result: ${confidence}% (need 90%+)`);
      return {
        text: "",
        confidence: confidence,
        characterCount: 0,
        belowThreshold: true,
      };
    }

    const cleanedText = normalizeExtractedText(rawText);

    logger.success(
      `Text extracted with ${confidence}% confidence (${cleanedText.length} characters)`
    );

    try {
      fs.unlinkSync(imagePath);
      logger.debug("Temporary image deleted");
    } catch (err) {
      logger.warn("Could not delete temporary image");
    }

    return {
      text: cleanedText,
      confidence: confidence,
      characterCount: cleanedText.length,
      belowThreshold: false,
    };
  } catch (err) {
    logger.error(`OCR extraction failed: ${err.message}`);
    // Clean up even on error
    try {
      fs.unlinkSync(imagePath);
    } catch (e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

export async function processImage(fileId) {
  const imagePath = await downloadImageFromTelegram(fileId);
  if (!imagePath) {
    return null;
  }

  const result = await extractTextFromImage(imagePath);
  return result;
}
