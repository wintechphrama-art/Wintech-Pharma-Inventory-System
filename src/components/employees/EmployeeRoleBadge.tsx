import type { UserRole } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  store_manager:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  supervisor:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  worker:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
};

interface Props {
  role: UserRole;
}

export default function EmployeeRoleBadge({ role }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
