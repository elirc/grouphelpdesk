// Author: Alex Chen
// Issue: #14 â€” Expose user lookup endpoints for assignment UI

import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@helpdesk/shared';

import { userService } from '../services/userService';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.query.role?.toString() as UserRole | undefined;
    const users = await userService.getUsers(role);
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}
