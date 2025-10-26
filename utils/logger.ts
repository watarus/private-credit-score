"use client";

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Use browser-compatible logging
export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  browser: {
    asObject: true,
    write: {
      info: (o: any) => console.info(o),
      error: (o: any) => console.error(o),
      warn: (o: any) => console.warn(o),
      debug: (o: any) => console.debug(o),
    },
  },
});
