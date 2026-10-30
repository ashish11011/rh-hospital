export const RH_CARD_DISCOUNT_PERCENT = 20;
export const RH_ID_CARD_LIST_AMOUNT_INR = 1200;
export const RH_ID_CARD_AMOUNT_INR = 501;
export const RH_ID_CARD_VALIDITY_YEARS = 2;
export const RH_CARD_OTHER_PROFESSION_MAX_LENGTH = 120;

// Shared by website, mobile APIs, and workshop registration. Windows are milliseconds.
export const RATE_LIMITS = {
  login: { limit: 6, windowMs: 15 * 60_000, ipLimit: 60 },
  signup: { limit: 5, windowMs: 15 * 60_000, ipLimit: 30 },
  forgotPassword: { limit: 3, windowMs: 5 * 60_000, ipLimit: 30 },
  resendCode: { limit: 3, windowMs: 5 * 60_000, ipLimit: 30 },
  confirmEmail: { limit: 6, windowMs: 5 * 60_000, ipLimit: 60 },
  resetPassword: { limit: 6, windowMs: 5 * 60_000, ipLimit: 60 },
  refresh: { limit: 120, windowMs: 60_000 },
  publicRead: { limit: 180, windowMs: 60_000 },
  publicWrite: { limit: 30, windowMs: 60_000 },
  contact: { limit: 5, windowMs: 10 * 60_000 },
  browserLogs: { limit: 100, windowMs: 60_000 },
  workshopMember: {
    send: { limit: 3, windowMs: 5 * 60_000 },
    incorrectAttempts: 5,
    otpValidityMs: 5 * 60_000,
    sessionValidityMs: 15 * 60_000,
  },
} as const;

export const REDIS_CACHE_TTL_SECONDS = {
  courses: 300,
  workshops: 120,
  reviews: 300,
  adminStats: 60,
} as const;

export const GLOBAL_CONFRENCE_IMAGES = [
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c1.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c2.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c3.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c4.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c5.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c6.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c7.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c8.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c9.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c10.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c11.jpg",
  "https://d2c3lsl35lix55.cloudfront.net/public/website-image/c12.jpg",
];
