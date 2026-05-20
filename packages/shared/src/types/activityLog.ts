// Author: Morgan Lee
// Issue: #31 â€” Define shared activity log types

export enum ActivityAction {
  STATUS_CHANGE = 'STATUS_CHANGE',
  ASSIGNED = 'ASSIGNED',
  COMMENTED = 'COMMENTED',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
}

export interface ActivityLogEntry {
  id: string;
  ticketId: string;
  userId: string;
  action: ActivityAction;
  details: unknown;
  createdAt: string;
  ticketTitle?: string;
  userName?: string;
}
