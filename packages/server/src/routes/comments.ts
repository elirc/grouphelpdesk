// Author: Alex Chen
// Issue: #12 â€” Register ticket comment routes

import { Router } from 'express';

import { createComment, listComments } from '../controllers/commentController';

export const commentRouter = Router({ mergeParams: true });

commentRouter.post('/', createComment);
commentRouter.get('/', listComments);
