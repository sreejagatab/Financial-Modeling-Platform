import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAuthLoading, type Role } from '../store/slices/auth.slice';

export type Permission =
  | 'model:create'
  | 'model:edit'
  | 'model:view'
  | 'model:delete'
  | 'scenario:create'
  | 'scenario:edit'
  | 'scenario:view'
  | 'dashboard:view'
  | 'dashboard:customize'
  | 'export:pdf'
  | 'export:pptx'
  | 'comments:create'
  | 'comments:resolve'
  | 'annotations:create'
  | 'admin:users'
  | 'admin:settings';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  analyst: [
    'model:create',
    'model:edit',
    'model:view',
    'model:delete',
    'scenario:create',
    'scenario:edit',
    'scenario:view',
    'dashboard:view',
    'export:pdf',
    'export:pptx',
    'comments:create',
    'comments:resolve',
    'annotations:create',
  ],
  stakeholder: [
    'model:view',
    'scenario:view',
    'dashboard:view',
    'dashboard:customize',
    'export:pdf',
    'export:pptx',
    'comments:create',
    'annotations:create',
  ],
  admin: [
    'model:create',
    'model:edit',
    'model:view',
    'model:delete',
    'scenario:create',
    'scenario:edit',
    'scenario:view',
    'dashboard:view',
    'dashboard:customize',
    'export:pdf',
    'export:pptx',
    'comments:create',
    'comments:resolve',
    'annotations:create',
    'admin:users',
    'admin:settings',
  ],
};

interface RoleContextValue {
  role: Role | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isLoading: boolean;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);

  // Local override for demo/switching roles
  const [overrideRole, setOverrideRole] = useState<Role | null>(null);

  const value = useMemo<RoleContextValue>(() => {
    // Use override role if set, otherwise use user's role from auth
    const role = overrideRole ?? user?.role ?? 'analyst'; // Default to analyst for demo
    const permissions = role ? ROLE_PERMISSIONS[role] : [];

    return {
      role,
      permissions,
      hasPermission: (permission) => permissions.includes(permission),
      hasAnyPermission: (perms) => perms.some((p) => permissions.includes(p)),
      hasAllPermissions: (perms) => perms.every((p) => permissions.includes(p)),
      isLoading,
      setRole: setOverrideRole,
    };
  }, [user?.role, isLoading, overrideRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export function usePermission(permission: Permission) {
  const { hasPermission, isLoading } = useRole();
  return { allowed: hasPermission(permission), isLoading };
}

// Permission Gate Component
interface PermissionGateProps {
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permissions,
  requireAll = true,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions } = useRole();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
