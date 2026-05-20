// Author: Alex Chen
// Issue: #4 â€” Map ticket HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../middleware/validateRequest';
import { ticketService } from '../services/ticketService';
import type { IdParams } from '../validation/commonSchemas';
import type {
  AssignTicketBody,
  CreateTicketBody,
  ListTicketsQuery,
  UpdateTicketBody,
} from '../validation/ticketSchemas';

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
    const result = await ticketService.getTickets(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const ticket = await ticketService.getTicketById(params.id);
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<UpdateTicketBody>(res);
    const ticket = await ticketService.updateTicket(params.id, body);
    res.json({ data: ticket });
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
    const result = await ticketService.deleteTicket(params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
