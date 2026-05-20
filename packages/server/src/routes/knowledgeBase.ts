// Author: Morgan Lee
// Issue: #35 â€” Register knowledge base routes

import { Router } from 'express';

import {
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  updateArticle,
} from '../controllers/knowledgeBaseController';

export const knowledgeBaseRouter = Router();

knowledgeBaseRouter.post('/', createArticle);
knowledgeBaseRouter.get('/', listArticles);
knowledgeBaseRouter.get('/:id', getArticle);
knowledgeBaseRouter.patch('/:id', updateArticle);
knowledgeBaseRouter.delete('/:id', deleteArticle);
