// Message Polling with Retry Logic

import { getUpdates } from "./api.js";
import { processUpdate } from "./handlers.js";
import { logger } from "./logger.js";
import { config } from "./config.js";

let offset = 0;
let retryCount = 0;

export async function startPolling() {
  try {
    const updates = await getUpdates(offset, config.POLL_TIMEOUT);

    if (retryCount > 0) {
      logger.success("Connection restored!");
      retryCount = 0;
    }

    for (const update of updates) {
      try {
        offset = update.update_id + 1;
        await processUpdate(update);
      } catch (err) {
        logger.error(`Error processing message: ${err.message}`);
      }
    }

    setTimeout(startPolling, config.MESSAGE_POLL_INTERVAL);
  } catch (err) {
    retryCount++;
    logger.warn(
      `Poll failed (Attempt ${retryCount}/${config.MAX_RETRIES}): ${err.message}`
    );

    if (retryCount >= config.MAX_RETRIES) {
      logger.error(
        `FATAL: Max retries (${config.MAX_RETRIES}) exceeded. Bot is shutting down.`
      );
      process.exit(1);
    }

    const backoffDelay =
      config.INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);

    logger.info(
      `Retrying in ${backoffDelay / 1000} seconds... (${retryCount}/${
        config.MAX_RETRIES
      })`
    );

    setTimeout(startPolling, backoffDelay);
  }
}

export function resetState() {
  offset = 0;
  retryCount = 0;
  logger.debug("Polling state reset");
}
