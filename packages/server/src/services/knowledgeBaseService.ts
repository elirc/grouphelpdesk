// Author: Morgan Lee
// Issue: #35 â€” Implement knowledge base article business logic

import { PrismaClient } from '@prisma/client';
import type { ArticleInput } from '@helpdesk/shared';

import { NotFoundError, ValidationError } from '../utils/errors';

const defaultPrisma = new PrismaClient();

function tagsFromJson(tags: unknown): string[] {
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((tag): tag is string => typeof tag === 'string')
        : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
}

function serializeArticle<T extends { tags: unknown; createdAt: Date; updatedAt: Date }>(
  article: T,
) {
  return {
    ...article,
    tags: tagsFromJson(article.tags),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export function createKnowledgeBaseService(prisma = defaultPrisma) {
  return {
    async listArticles(search?: string) {
      const articles = await prisma.article.findMany({
        where: search
          ? {
              OR: [{ title: { contains: search } }, { category: { contains: search } }],
            }
          : undefined,
        orderBy: { updatedAt: 'desc' },
      });

      const normalized = articles.map(serializeArticle);
      return search
        ? normalized.filter((article) =>
            [article.title, article.category, ...article.tags].some((value) =>
              value.toLowerCase().includes(search.toLowerCase()),
            ),
          )
        : normalized;
    },

    async getArticle(id: string) {
      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) {
        throw new NotFoundError('Article could not be found.');
      }

      return serializeArticle(article);
    },

    async createArticle(input: ArticleInput) {
      if (!input.title.trim() || !input.body.trim() || !input.category.trim()) {
        throw new ValidationError('Title, body, and category are required.');
      }

      const author = await prisma.user.findUnique({ where: { id: input.authorId } });
      if (!author) {
        throw new ValidationError('Article author must reference an existing user.');
      }

      const article = await prisma.article.create({
        data: {
          title: input.title.trim(),
          body: input.body.trim(),
          category: input.category.trim(),
          tags: JSON.stringify(input.tags ?? []),
          authorId: input.authorId,
        },
      });

      return serializeArticle(article);
    },

    async updateArticle(id: string, input: Partial<ArticleInput>) {
      await this.getArticle(id);

      const article = await prisma.article.update({
        where: { id },
        data: {
          title: input.title?.trim(),
          body: input.body?.trim(),
          category: input.category?.trim(),
          tags: input.tags ? JSON.stringify(input.tags) : undefined,
        },
      });

      return serializeArticle(article);
    },

    async deleteArticle(id: string) {
      await this.getArticle(id);
      await prisma.article.delete({ where: { id } });
      return { id, deleted: true };
    },
  };
}

export const knowledgeBaseService = createKnowledgeBaseService();
