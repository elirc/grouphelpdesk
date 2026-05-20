// Author: Alex Chen
// Issue: #12 â€” Map comment HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '@helpdesk/shared';

import { commentService } from '../services/commentService';

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.createComment(
      req.params.ticketId,
      req.body.authorId,
      req.body.body,
      Boolean(req.body.isInternal),
    );

    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const viewerRole =
      (req.query.viewerRole?.toString() as UserRole | undefined) ?? UserRole.REQUESTER;
    const includeInternal = req.query.includeInternal === 'true';
    const comments = await commentService.getComments(
      req.params.ticketId,
      includeInternal,
      viewerRole,
    );

    res.json({ data: comments });
  } catch (error) {
    next(error);
  }
}
