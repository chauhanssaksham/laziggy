/** Maximum number of menu images allowed per demo */
export const MAX_MENU_IMAGES = 35;

/** Maximum file size for uploads in MB */
export const MAX_FILE_SIZE_MB = 10;

/** Maximum file size for uploads in bytes */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Maximum length of a single chat message (characters) */
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

/** Maximum number of user messages allowed per chat session */
export const MAX_CHAT_USER_MESSAGES = 100;

/** Maximum length of a menuId (covers nanoid-8 for demos, UUIDs for menus) */
export const MAX_MENU_ID_LENGTH = 64;

/** Maximum length of restaurant name passed to AI */
export const MAX_RESTAURANT_NAME_LENGTH = 200;

/** Minimum cooldown between chat sends (ms) */
export const CHAT_SEND_COOLDOWN_MS = 1000;
