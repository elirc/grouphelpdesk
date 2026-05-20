// Author: Alex Chen
// Issue: #4 â€” Map ticket HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';
import { Priority } from '@helpdesk/shared';
import type { TicketStatus } from '@helpdesk/shared';

import { ticketService } from '../services/ticketService';
import { ValidationError } from '../utils/errors';

function parseEnum<T extends Record<string, string>>(enumObject: T, value: unknown, field: string) {
  if (typeof value !== 'string' || !Object.values(enumObject).includes(value)) {
    throw new ValidationError(`${field} is invalid.`);
  }

  return value as T[keyof T];
}

function splitQuery(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(','));
  return String(value).split(',');
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.createTicket({
      title: req.body.title,
      description: req.body.description,
      priority: parseEnum(Priority, req.body.priority, 'priority') as Priority,
      createdBy: req.body.createdBy,
      assigneeId: req.body.assigneeId ?? null,
      teamId: req.body.teamId ?? null,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    });

    res.status(201).json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const status = splitQuery(req.query.status) as TicketStatus[] | undefined;
    const priority = splitQuery(req.query.priority) as Priority[] | undefined;

    const result = await ticketService.getTickets({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      status,
      priority,
      assigneeId: req.query.assigneeId?.toString(),
      search: req.query.search?.toString(),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function assignTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.assignTicket(
      req.params.id,
      req.body.assigneeId,
      req.body.actorId ?? req.body.assigneeId,
    );
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.deleteTicket(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
