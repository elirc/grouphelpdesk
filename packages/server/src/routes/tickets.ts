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

export const ticketRouter = Router();

ticketRouter.post('/', createTicket);
ticketRouter.get('/', listTickets);
ticketRouter.patch('/:id/assign', assignTicket);
ticketRouter.get('/:id', getTicket);
ticketRouter.patch('/:id', updateTicket);
ticketRouter.delete('/:id', deleteTicket);
