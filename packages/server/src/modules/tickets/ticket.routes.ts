// Author: Alex Chen
// Issue: Learning Phase 3 - Register ticket module routes

import { Router } from 'express';

import { validateBody, validateParams, validateQuery } from '../../middleware/validateRequest';
import { idParamsSchema } from '../../validation/commonSchemas';
import {
  assignTicket,
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from './ticket.controller';
import {
  assignTicketBodySchema,
  createTicketBodySchema,
  listTicketsQuerySchema,
  updateTicketBodySchema,
} from './ticket.schema';

export const ticketRouter = Router();

ticketRouter.post('/', validateBody(createTicketBodySchema), createTicket);
ticketRouter.get('/', validateQuery(listTicketsQuerySchema), listTickets);
ticketRouter.patch(
  '/:id/assign',
  validateParams(idParamsSchema),
  validateBody(assignTicketBodySchema),
  assignTicket,
);
ticketRouter.get('/:id', validateParams(idParamsSchema), getTicket);
ticketRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateTicketBodySchema),
  updateTicket,
);
ticketRouter.delete('/:id', validateParams(idParamsSchema), deleteTicket);
