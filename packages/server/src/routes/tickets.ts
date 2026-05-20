// Author: Alex Chen
// Issue: #4 â€” Register ticket API routes

import { Router } from 'express';

import {
  assignTicket,
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from '../controllers/ticketController';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest';
import { idParamsSchema } from '../validation/commonSchemas';
import {
  assignTicketBodySchema,
  createTicketBodySchema,
  listTicketsQuerySchema,
  updateTicketBodySchema,
} from '../validation/ticketSchemas';

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
