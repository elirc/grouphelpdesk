// Author: Morgan Lee
// Issue: #39 â€” Test comment visibility filtering

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createCommentService } from '../../packages/server/src/services/commentService';

function createMockPrisma() {
  return {
    ticket: { findUnique: vi.fn().mockResolvedValue({ id: 'ticket_1' }) },
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'agent_1', role: UserRole.AGENT }) },
    comment: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    activityLog: { create: vi.fn() },
  };
}

describe('commentService', () => {
  it('hides internal comments from requester views', async () => {
    const prisma = createMockPrisma();
    const service = createCommentService(prisma as never);

    await service.getComments('ticket_1', true, UserRole.REQUESTER);

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isInternal: false }),
      }),
    );
  });

  it('allows agents to include internal comments', async () => {
    const prisma = createMockPrisma();
    const service = createCommentService(prisma as never);

    await service.getComments('ticket_1', true, UserRole.AGENT);

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isInternal: undefined }),
      }),
    );
  });
});
