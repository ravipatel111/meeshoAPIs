const isProduction =
  process.env.NODE_ENV === "production" ||
  (process.env.CLIENT_URL && process.env.CLIENT_URL.includes("https"));

export const cookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};
