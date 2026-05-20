// Author: Sam Rivera
// Issue: #7 â€” Manage ticket data fetching state

import { useEffect, useState } from 'react';
import type { Ticket, TicketFilters } from '@helpdesk/shared';

import { api } from '../services/api';

export function useTickets(filters: TicketFilters = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadTickets() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.tickets.list(filters);
        if (isCurrent) {
          setTickets(response.data);
        }
      } catch (caught) {
        if (isCurrent) {
          setError(caught instanceof Error ? caught.message : 'Failed to load tickets.');
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      isCurrent = false;
    };
  }, [JSON.stringify(filters)]);

  return { tickets, loading, error };
}

export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const ticketId = id;

    async function loadTicket() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.tickets.get(ticketId);
        setTicket(response.data);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Failed to load ticket.');
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [id]);

  return { ticket, loading, error, setTicket };
}
