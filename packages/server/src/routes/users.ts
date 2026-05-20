// Author: Alex Chen
// Issue: #14 â€” Register user lookup routes

import { Router } from 'express';

import { listUsers } from '../controllers/userController';

export const userRouter = Router();

userRouter.get('/', listUsers);
