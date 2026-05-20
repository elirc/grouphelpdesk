// Author: Alex Chen
// Issue: Learning Phase 3 - Compatibility exports for ticket module service

import { PrismaClient } from '@prisma/client';

import { createActivityLogService } from './activityLogService';
import {
  createTicketService as createTicketModuleService,
  ticketService,
} from '../modules/tickets/ticket.service';
import { createTicketRepository } from '../modules/tickets/ticket.repository';

export function createTicketService(prisma: PrismaClient = new PrismaClient()) {
  return createTicketModuleService(
    createTicketRepository(prisma),
    createActivityLogService(prisma),
  );
}

export { ticketService };
