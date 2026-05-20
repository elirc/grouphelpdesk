// Author: Morgan Lee
// Issue: #35 â€” Map knowledge base HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../middleware/validateRequest';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import type { IdParams } from '../validation/commonSchemas';
import type { ArticleBody, UpdateArticleBody } from '../validation/knowledgeBaseSchemas';

export async function listArticles(_req: Request, res: Response, next: NextFunction) {
  try {
    const query = getValidatedQuery<{ search?: string }>(res);
    res.json({ data: await knowledgeBaseService.listArticles(query.search) });
  } catch (error) {
    next(error);
  }
}

export async function getArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.getArticle(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<ArticleBody>(res);
    const article = await knowledgeBaseService.createArticle(body);
    res.status(201).json({ data: article });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<UpdateArticleBody>(res);
    res.json({ data: await knowledgeBaseService.updateArticle(params.id, body) });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.deleteArticle(params.id) });
  } catch (error) {
    next(error);
  }
}
