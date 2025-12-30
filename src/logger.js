// Unified logging system

const LogLevel = {
  DEBUG: "[D]",
  INFO: "[I]",
  SUCCESS: "[S]",
  WARN: "[W]",
  ERROR: "[E]",
  BUSY: "[.]",
  TELEGRAM: "[T]",
  IMAGE: "[IMG]",
  TEXT: "[TXT]",
};

export const logger = {
  debug: (message) => {
    console.log(`${LogLevel.DEBUG} ${message}`);
  },

  info: (message) => {
    console.log(`${LogLevel.INFO} ${message}`);
  },

  success: (message) => {
    console.log(`${LogLevel.SUCCESS} ${message}`);
  },

  warn: (message) => {
    console.warn(`${LogLevel.WARN} ${message}`);
  },

  error: (message) => {
    console.error(`${LogLevel.ERROR} ${message}`);
  },

  busy: (message) => {
    console.log(`${LogLevel.BUSY} ${message}`);
  },

  telegram: (message) => {
    console.log(`${LogLevel.TELEGRAM} ${message}`);
  },

  image: (message) => {
    console.log(`${LogLevel.IMAGE} ${message}`);
  },

  text: (message) => {
    console.log(`${LogLevel.TEXT} ${message}`);
  },
};
