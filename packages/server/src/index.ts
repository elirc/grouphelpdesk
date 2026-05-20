// Author: Alex Chen
// Issue: #3 â€” Bootstrap Express API and route layering

import cors from 'cors';
import express from 'express';

import { authRouter } from './routes/auth';
import { commentRouter } from './routes/comments';
import { dashboardRouter } from './routes/dashboard';
import { healthRouter } from './routes/health';
import { knowledgeBaseRouter } from './routes/knowledgeBase';
import { ticketRouter } from './routes/tickets';
import { userRouter } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { optionalAuth } from './middleware/auth';
import { requestLogger } from './middleware/requestLogger';
import { responseTime } from './middleware/responseTime';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(responseTime);
  app.use(requestLogger);
  app.use(optionalAuth);

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tickets/:ticketId/comments', commentRouter);
  app.use('/api/tickets', ticketRouter);
  app.use('/api/users', userRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/articles', knowledgeBaseRouter);

  app.use(errorHandler);

  return app;
}

const port = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== 'test') {
  createApp().listen(port, () => {
    logger.info({ port }, 'HelpDesk API listening');
  });
}
