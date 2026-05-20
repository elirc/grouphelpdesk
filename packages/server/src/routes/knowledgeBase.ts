// Author: Morgan Lee
// Issue: #35 â€” Register knowledge base routes

import { Router } from 'express';
import { UserRole } from '@helpdesk/shared';

import {
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  updateArticle,
} from '../controllers/knowledgeBaseController';
import { requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest';
import { idParamsSchema, optionalSearchQuerySchema } from '../validation/commonSchemas';
import { articleBodySchema, updateArticleBodySchema } from '../validation/knowledgeBaseSchemas';

export const knowledgeBaseRouter = Router();

knowledgeBaseRouter.post(
  '/',
  validateBody(articleBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  createArticle,
);
knowledgeBaseRouter.get('/', validateQuery(optionalSearchQuerySchema), listArticles);
knowledgeBaseRouter.get('/:id', validateParams(idParamsSchema), getArticle);
knowledgeBaseRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateArticleBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  updateArticle,
);
knowledgeBaseRouter.delete(
  '/:id',
  validateParams(idParamsSchema),
  requireRole(UserRole.ADMIN),
  deleteArticle,
);
