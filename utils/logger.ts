"use client";

// Simple browser-only logger
const isDevelopment = typeof window !== "undefined" && process.env.NODE_ENV === "development";

export const logger = {
  info: (message: any, ...args: any[]) => {
    if (typeof window !== "undefined") {
      console.info("[INFO]", message, ...args);
    }
  },
  error: (message: any, ...args: any[]) => {
    if (typeof window !== "undefined") {
      console.error("[ERROR]", message, ...args);
    }
  },
  warn: (message: any, ...args: any[]) => {
    if (typeof window !== "undefined") {
      console.warn("[WARN]", message, ...args);
    }
  },
  debug: (message: any, ...args: any[]) => {
    if (typeof window !== "undefined" && isDevelopment) {
      console.debug("[DEBUG]", message, ...args);
    }
  },
};
