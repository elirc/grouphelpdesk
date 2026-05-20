// Author: Sam Rivera
// Issue: Learning Phase 4 - Show authenticated user context in the layout

import { useAuth } from '../../auth/AuthProvider';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <div>
        <p className="text-sm text-slate-600">Internal support operations</p>
        {user ? (
          <p className="text-xs text-slate-500">
            Signed in as {user.name} ({user.role})
          </p>
        ) : null}
      </div>
      <button
        className="rounded-lg border border-line px-3 py-2 text-sm font-semibold"
        onClick={logout}
      >
        Sign out
      </button>
    </header>
  );
}
