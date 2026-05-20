// Author: Alex Chen
// Issue: #14 â€” Provide user lookup and assignment helpers

import { PrismaClient } from '@prisma/client';
import { UserRole } from '@helpdesk/shared';

import { NotFoundError, ValidationError } from '../utils/errors';

const defaultPrisma = new PrismaClient();

export function createUserService(prisma = defaultPrisma) {
  return {
    async getUsers(role?: UserRole) {
      return prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: { name: 'asc' },
      });
    },

    async requireAgent(userId: string) {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundError('Assignee could not be found.');
      }

      if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
        throw new ValidationError('Tickets can only be assigned to agents or admins.');
      }

      return user;
    },
  };
}

export const userService = createUserService();
