// Author: Alex Chen
// Issue: #31 â€” Register dashboard API routes

import { Router } from 'express';

import {
  getAgentWorkload,
  getDashboardActivity,
  getDashboardMetrics,
  getSystemHealth,
} from '../controllers/dashboardController';

export const dashboardRouter = Router();

dashboardRouter.get('/metrics', getDashboardMetrics);
dashboardRouter.get('/activity', getDashboardActivity);
dashboardRouter.get('/agent-workload', getAgentWorkload);
dashboardRouter.get('/system', getSystemHealth);
