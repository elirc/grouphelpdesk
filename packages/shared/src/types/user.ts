// Author: Morgan Lee
// Issue: #9 â€” Define shared user types

export enum UserRole {
  AGENT = 'AGENT',
  REQUESTER = 'REQUESTER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string | null;
}
