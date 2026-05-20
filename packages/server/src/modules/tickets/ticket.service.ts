// Author: Alex Chen
// Issue: Learning Phase 3 - Move ticket business rules into a module service

import {
  ActivityAction,
  TicketStatus,
  type CreateTicketInput,
  type TicketFilters,
  type UpdateTicketInput,
} from '@helpdesk/shared';

import { createActivityLogService } from '../../services/activityLogService';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { canTransition } from '../../utils/statusMachine';
import { mapTicketToResponse } from './ticket.mapper';
import { canBeAssignedTicket, canMoveToInProgress } from './ticket.permissions';
import { createTicketRepository } from './ticket.repository';
import type { TicketRepository } from './ticket.types';

type AuthenticatedCreateTicketInput = CreateTicketInput & { createdBy: string };

export function createTicketService(
  repository: TicketRepository = createTicketRepository(),
  activityLog = createActivityLogService(),
) {
  return {
    async createTicket(input: AuthenticatedCreateTicketInput) {
      const creator = await repository.findUserById(input.createdBy);
      if (!creator) {
        throw new ValidationError('Ticket creator must reference an existing user.');
      }

      if (input.assigneeId) {
        const assignee = await repository.findUserById(input.assigneeId);
        if (!canBeAssignedTicket(assignee)) {
          throw new ValidationError('Assignee must be an agent or admin.');
        }
      }

      const ticket = await repository.createTicket({
        title: input.title.trim(),
        description: input.description.trim(),
        priority: input.priority,
        createdBy: input.createdBy,
        assigneeId: input.assigneeId ?? null,
        teamId: input.teamId ?? null,
        tags: JSON.stringify(input.tags ?? []),
      });

      await activityLog.logActivity(ticket.id, input.createdBy, ActivityAction.CREATED, {
        title: ticket.title,
        priority: ticket.priority,
      });

      return mapTicketToResponse(ticket);
    },

    async getTickets(filters: TicketFilters = {}) {
      const page = Math.max(Number(filters.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(filters.limit ?? 20), 1), 100);
      const { total, tickets } = await repository.listTickets({ ...filters, page, limit });

      return {
        data: tickets.map(mapTicketToResponse),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    async getTicketById(id: string) {
      const ticket = await repository.findTicketById(id);
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      return mapTicketToResponse(ticket);
    },

    async updateTicket(id: string, input: UpdateTicketInput) {
      const existing = await repository.findTicketForUpdate(id);
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }

      if (input.assigneeId) {
        const assignee = await repository.findUserById(input.assigneeId);
        if (!canBeAssignedTicket(assignee)) {
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

      if (
        input.status === TicketStatus.IN_PROGRESS &&
        !canMoveToInProgress(input.assigneeId ?? existing.assigneeId)
      ) {
        throw new ValidationError('Moving a ticket to IN_PROGRESS requires an assignee.');
      }

      const now = new Date();
      const ticket = await repository.updateTicket(id, {
        title: input.title?.trim(),
        description: input.description?.trim(),
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        teamId: input.teamId,
        tags: input.tags ? JSON.stringify(input.tags) : undefined,
        resolvedAt: input.status === TicketStatus.RESOLVED ? now : undefined,
        closedAt: input.status === TicketStatus.CLOSED ? now : undefined,
      });

      const actorId = input.actorId ?? existing.createdBy;
      if (input.status && input.status !== existing.status) {
        await repository.createStatusHistory({
          ticketId: ticket.id,
          changedBy: actorId,
          fromStatus: existing.status,
          toStatus: input.status,
        });
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.STATUS_CHANGE, {
          from: existing.status,
          to: input.status,
        });
      } else if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
        await repository.createAssignmentHistory({
          ticketId: ticket.id,
          changedBy: actorId,
          fromAssigneeId: existing.assigneeId,
          toAssigneeId: input.assigneeId,
        });
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.ASSIGNED, {
          from: existing.assigneeId,
          to: input.assigneeId,
        });
      } else {
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.UPDATED, input);
      }

      return mapTicketToResponse(ticket);
    },

    async assignTicket(id: string, assigneeId: string, actorId: string) {
      const assignee = await repository.findUserById(assigneeId);
      if (!canBeAssignedTicket(assignee)) {
        throw new ValidationError('Assignee must be an agent or admin.');
      }

      return this.updateTicket(id, { assigneeId, actorId });
    },

    async deleteTicket(id: string) {
      const existing = await repository.findTicketForUpdate(id);
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }

      await repository.deleteTicket(id);

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
