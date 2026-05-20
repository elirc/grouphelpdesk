// Author: Morgan Lee
// Issue: Learning Phase 4 - Test password verification and session creation

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createAuthService } from '../../packages/server/src/services/authService';
import { AppError } from '../../packages/server/src/utils/errors';
import { hashPassword } from '../../packages/server/src/utils/password';

function createMockPrisma(passwordHash: string) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'user_agent_1',
        name: 'Avery Agent',
        email: 'avery.agent@example.com',
        passwordHash,
        role: UserRole.AGENT,
        teamId: 'team-it',
      }),
    },
  };
}

describe('authService', () => {
  it('logs in with a valid password and returns a session token without exposing the hash', async () => {
    const passwordHash = await hashPassword('agent123');
    const service = createAuthService(createMockPrisma(passwordHash) as never);

    const result = await service.login('avery.agent@example.com', 'agent123');

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('avery.agent@example.com');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(service.getCurrentUser(result.token)?.id).toBe('user_agent_1');
  });

  it('rejects invalid credentials without revealing which field was wrong', async () => {
    const passwordHash = await hashPassword('agent123');
    const service = createAuthService(createMockPrisma(passwordHash) as never);

    await expect(service.login('avery.agent@example.com', 'wrong-password')).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
