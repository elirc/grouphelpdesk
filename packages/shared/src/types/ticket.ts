// Author: Morgan Lee
// Issue: #9 â€” Define shared ticket types

import type { Priority } from '../constants/priority';
import type { TicketStatus } from '../constants/status';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  createdBy: string;
  assigneeId: string | null;
  teamId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
  createdBy: string;
  assigneeId?: string | null;
  teamId?: string | null;
  tags?: string[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: Priority;
  assigneeId?: string | null;
  teamId?: string | null;
  tags?: string[];
  actorId?: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | TicketStatus[];
  priority?: Priority | Priority[];
  assigneeId?: string;
  search?: string;
}
