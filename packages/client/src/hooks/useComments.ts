// Author: Sam Rivera
// Issue: #13 â€” Manage ticket comment state

import { useEffect, useState } from 'react';
import type { Comment } from '@helpdesk/shared';

import { api } from '../services/api';

export function useComments(ticketId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(Boolean(ticketId));
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!ticketId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.comments.list(ticketId, true);
      setComments(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }

  async function addComment(body: string, authorId: string, isInternal: boolean) {
    if (!ticketId) return;
    const response = await api.comments.create({ ticketId, body, authorId, isInternal });
    setComments((current) => [...current, response.data]);
  }

  useEffect(() => {
    refresh();
  }, [ticketId]);

  return { comments, loading, error, addComment, refresh };
}
