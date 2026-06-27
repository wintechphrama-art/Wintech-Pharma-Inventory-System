import { useCallback } from "react";

import { useAuth } from "./useAuth";
import { hasPermission, type Action } from "@/lib/permissions";

/**
 * Hook that provides permission checking based on the
 * current user's role. Returns a `can(action)` function
 * for easy use in components and conditional rendering.
 */
export function usePermissions() {
  const { profile } = useAuth();

  const can = useCallback(
    (action: Action): boolean => {
      return hasPermission(profile?.role, action);
    },
    [profile?.role]
  );

  return {
    can,
    role: profile?.role ?? null,
  };
}
