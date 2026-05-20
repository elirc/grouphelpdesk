// Author: Morgan Lee
// Issue: Learning Phase 2 - Validate knowledge base API inputs

import { z } from 'zod';

export const articleBodySchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  body: z.string().trim().min(1, 'body is required'),
  category: z.string().trim().min(1, 'category is required'),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  authorId: z.string().trim().min(1).optional(),
});

export const updateArticleBodySchema = articleBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one article field is required.',
  });

export type ArticleBody = z.infer<typeof articleBodySchema>;
export type UpdateArticleBody = z.infer<typeof updateArticleBodySchema>;
