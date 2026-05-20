// Author: Alex Chen
// Issue: Learning Phase 3 - Keep ticket HTTP mapping inside the ticket module

import type { NextFunction, Request, Response } from 'express';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../../middleware/validateRequest';
import type { IdParams } from '../../validation/commonSchemas';
import { ticketService } from './ticket.service';
import type {
  AssignTicketBody,
  CreateTicketBody,
  ListTicketsQuery,
  UpdateTicketBody,
} from './ticket.schema';

export async function createTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<CreateTicketBody>(res);
    const ticket = await ticketService.createTicket(body);
    res.status(201).json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function listTickets(_req: Request, res: Response, next: NextFunction) {
  try {
    const query = getValidatedQuery<ListTicketsQuery>(res);
    res.json(await ticketService.getTickets(query));
  } catch (error) {
    next(error);
  }
}

export async function getTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await ticketService.getTicketById(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<UpdateTicketBody>(res);
    res.json({ data: await ticketService.updateTicket(params.id, body) });
  } catch (error) {
    next(error);
  }
}

export async function assignTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<AssignTicketBody>(res);
    const ticket = await ticketService.assignTicket(
      params.id,
      body.assigneeId,
      body.actorId ?? body.assigneeId,
    );
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json(await ticketService.deleteTicket(params.id));
  } catch (error) {
    next(error);
  }
}
