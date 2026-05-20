// Author: Alex Chen
// Issue: #12 â€” Implement comment business logic and visibility filtering

import { PrismaClient } from '@prisma/client';
import { ActivityAction, UserRole } from '@helpdesk/shared';

import { NotFoundError, ValidationError } from '../utils/errors';
import { createActivityLogService } from './activityLogService';

const defaultPrisma = new PrismaClient();

function serializeComment(comment: { createdAt: Date }) {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  };
}

export function createCommentService(prisma = defaultPrisma) {
  const activityLog = createActivityLogService(prisma);

  return {
    async createComment(ticketId: string, authorId: string, body: string, isInternal = false) {
      if (!body.trim()) {
        throw new ValidationError('Comment body is required.');
      }

      const [ticket, author] = await Promise.all([
        prisma.ticket.findUnique({ where: { id: ticketId } }),
        prisma.user.findUnique({ where: { id: authorId } }),
      ]);

      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      if (!author) {
        throw new ValidationError('Comment author must reference an existing user.');
      }

      if (isInternal && [UserRole.CUSTOMER, UserRole.REQUESTER].includes(author.role as UserRole)) {
        throw new ValidationError('Requesters cannot create internal notes.');
      }

      const comment = await prisma.comment.create({
        data: {
          ticketId,
          authorId,
          body: body.trim(),
          isInternal,
        },
      });

      await activityLog.logActivity(ticketId, authorId, ActivityAction.COMMENTED, {
        commentId: comment.id,
        isInternal,
      });

      return serializeComment(comment);
    },

    async getComments(ticketId: string, includeInternal: boolean, viewerRole: UserRole) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      const canSeeInternal =
        includeInternal && [UserRole.AGENT, UserRole.ADMIN].includes(viewerRole);

      const comments = await prisma.comment.findMany({
        where: {
          ticketId,
          isInternal: canSeeInternal ? undefined : false,
        },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      });

      return comments.map(serializeComment);
    },
  };
}

export const commentService = createCommentService();
