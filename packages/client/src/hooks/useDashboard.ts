// Author: Sam Rivera
// Issue: #32 â€” Fetch dashboard metrics and activity

import { useEffect, useState } from 'react';
import type { AgentWorkload, DashboardMetrics, SystemHealth } from '@helpdesk/shared';

import { api } from '../services/api';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activity, setActivity] = useState<unknown[]>([]);
  const [workload, setWorkload] = useState<AgentWorkload[]>([]);
  const [system, setSystem] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [metricsResult, activityResult, workloadResult, systemResult] = await Promise.all([
          api.dashboard.metrics(),
          api.dashboard.activity(),
          api.dashboard.workload(),
          api.dashboard.system(),
        ]);
        setMetrics(metricsResult.data);
        setActivity(activityResult.data);
        setWorkload(workloadResult.data);
        setSystem(systemResult.data);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return { metrics, activity, workload, system, loading, error };
}
