// Author: Morgan Lee
// Issue: #35 â€” Map knowledge base HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';

import { knowledgeBaseService } from '../services/knowledgeBaseService';

export async function listArticles(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await knowledgeBaseService.listArticles(req.query.search?.toString()) });
  } catch (error) {
    next(error);
  }
}

export async function getArticle(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await knowledgeBaseService.getArticle(req.params.id) });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await knowledgeBaseService.createArticle(req.body);
    res.status(201).json({ data: article });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await knowledgeBaseService.updateArticle(req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await knowledgeBaseService.deleteArticle(req.params.id) });
  } catch (error) {
    next(error);
  }
}
