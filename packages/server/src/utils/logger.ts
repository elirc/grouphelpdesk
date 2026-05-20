// Author: Jordan Park
// Issue: #27 â€” Configure structured logging with Pino

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'helpdesk-api',
    environment: process.env.NODE_ENV ?? 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type AppLogger = typeof logger;
