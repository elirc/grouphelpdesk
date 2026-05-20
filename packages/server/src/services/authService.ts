// Author: Morgan Lee
// Issue: Learning Phase 4 - Authenticate users and issue learning-friendly sessions

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

import { AppError } from '../utils/errors';
import { verifyPassword } from '../utils/password';

const defaultPrisma = new PrismaClient();

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string | null;
}

interface Session {
  token: string;
  user: CurrentUser;
  createdAt: Date;
}

const sessions = new Map<string, Session>();

function toCurrentUser(user: CurrentUser): CurrentUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
  };
}

export function createAuthService(prisma = defaultPrisma) {
  return {
    async login(email: string, password: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      const isValidPassword = user ? await verifyPassword(password, user.passwordHash) : false;

      if (!user || !isValidPassword) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      }

      const token = randomUUID();
      const currentUser = toCurrentUser(user);
      sessions.set(token, { token, user: currentUser, createdAt: new Date() });

      return { token, user: currentUser };
    },

    getCurrentUser(token: string | undefined) {
      if (!token) return null;
      return sessions.get(token)?.user ?? null;
    },

    logout(token: string | undefined) {
      if (token) {
        sessions.delete(token);
      }
    },
  };
}

export const authService = createAuthService();
