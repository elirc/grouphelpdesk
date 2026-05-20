// Author: Alex Chen
// Issue: #5 â€” Implement ticket business logic and Prisma data access

import { PrismaClient, type Prisma } from '@prisma/client';
import {
  ActivityAction,
  TicketStatus,
  UserRole,
  type CreateTicketInput,
  type TicketFilters,
  type UpdateTicketInput,
} from '@helpdesk/shared';

import { NotFoundError, ValidationError } from '../utils/errors';
import { canTransition } from '../utils/statusMachine';
import { createActivityLogService } from './activityLogService';

const defaultPrisma = new PrismaClient();

function parseTags(tags: unknown): string[] {
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

function serializeTicket<
  T extends {
    tags: unknown;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
    closedAt: Date | null;
  },
>(ticket: T) {
  return {
    ...ticket,
    tags: parseTags(ticket.tags),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    closedAt: ticket.closedAt?.toISOString() ?? null,
  };
}

function listValue<T>(value?: T | T[]): T[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

export function createTicketService(prisma = defaultPrisma) {
  const activityLog = createActivityLogService(prisma);

  return {
    async createTicket(input: CreateTicketInput) {
      if (!input.title?.trim()) {
        throw new ValidationError('Ticket title is required.');
      }

      if (!input.description?.trim()) {
        throw new ValidationError('Ticket description is required.');
      }

      const creator = await prisma.user.findUnique({ where: { id: input.createdBy } });
      if (!creator) {
        throw new ValidationError('Ticket creator must reference an existing user.');
      }

      if (input.assigneeId) {
        const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId } });
        if (!assignee || (assignee.role !== UserRole.AGENT && assignee.role !== UserRole.ADMIN)) {
          throw new ValidationError('Assignee must be an agent or admin.');
        }
      }

      const ticket = await prisma.ticket.create({
        data: {
          title: input.title.trim(),
          description: input.description.trim(),
          priority: input.priority,
          createdBy: input.createdBy,
          assigneeId: input.assigneeId ?? null,
          teamId: input.teamId ?? null,
          tags: JSON.stringify(input.tags ?? []),
        },
      });

      await activityLog.logActivity(ticket.id, input.createdBy, ActivityAction.CREATED, {
        title: ticket.title,
        priority: ticket.priority,
      });

      return serializeTicket(ticket);
    },

    async getTickets(filters: TicketFilters = {}) {
      const page = Math.max(Number(filters.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(filters.limit ?? 20), 1), 100);
      const skip = (page - 1) * limit;
      const statuses = listValue(filters.status);
      const priorities = listValue(filters.priority);

      const where: Prisma.TicketWhereInput = {
        status: statuses ? { in: statuses } : undefined,
        priority: priorities ? { in: priorities } : undefined,
        assigneeId: filters.assigneeId || undefined,
        OR: filters.search
          ? [{ title: { contains: filters.search } }, { description: { contains: filters.search } }]
          : undefined,
      };

      const [total, tickets] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return {
        data: tickets.map(serializeTicket),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    async getTicketById(id: string) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          assignee: true,
          creator: true,
        },
      });

      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      return serializeTicket(ticket);
    },

    async updateTicket(id: string, input: UpdateTicketInput) {
      const existing = await prisma.ticket.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }

      if (input.assigneeId) {
        const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId } });
        if (!assignee || (assignee.role !== UserRole.AGENT && assignee.role !== UserRole.ADMIN)) {
          throw new ValidationError('Assignee must be an agent or admin.');
        }
      }

      if (
        input.status &&
        !canTransition(existing.status as TicketStatus, input.status as TicketStatus)
      ) {
        throw new ValidationError(
          `Cannot transition ticket from ${existing.status} to ${input.status}.`,
        );
      }

      if (input.status === TicketStatus.IN_PROGRESS && !(input.assigneeId ?? existing.assigneeId)) {
        throw new ValidationError('Moving a ticket to IN_PROGRESS requires an assignee.');
      }

      const now = new Date();
      const ticket = await prisma.ticket.update({
        where: { id },
        data: {
          title: input.title?.trim(),
          description: input.description?.trim(),
          status: input.status,
          priority: input.priority,
          assigneeId: input.assigneeId,
          teamId: input.teamId,
          tags: input.tags ? JSON.stringify(input.tags) : undefined,
          resolvedAt: input.status === TicketStatus.RESOLVED ? now : undefined,
          closedAt: input.status === TicketStatus.CLOSED ? now : undefined,
        },
      });

      const actorId = input.actorId ?? existing.createdBy;
      if (input.status && input.status !== existing.status) {
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.STATUS_CHANGE, {
          from: existing.status,
          to: input.status,
        });
      } else if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.ASSIGNED, {
          from: existing.assigneeId,
          to: input.assigneeId,
        });
      } else {
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.UPDATED, input);
      }

      return serializeTicket(ticket);
    },

    async assignTicket(id: string, assigneeId: string, actorId: string) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee || (assignee.role !== UserRole.AGENT && assignee.role !== UserRole.ADMIN)) {
        throw new ValidationError('Assignee must be an agent or admin.');
      }

      return this.updateTicket(id, { assigneeId, actorId });
    },

    async deleteTicket(id: string) {
      const existing = await prisma.ticket.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }

      await prisma.ticket.delete({ where: { id } });

      return {
        data: {
          id,
          deleted: true,
        },
      };
    },
  };
}

export const ticketService = createTicketService();
