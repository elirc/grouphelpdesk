// Author: Morgan Lee
// Issue: #35 â€” Define shared knowledge base types

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleInput {
  title: string;
  body: string;
  category: string;
  tags?: string[];
  authorId: string;
}
