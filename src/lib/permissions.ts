import type { UserRole } from "@/types/auth";

export type Action =
  | "view_employees"
  | "create_employee"
  | "edit_employee"
  | "delete_employee"
  | "approve_employee"
  | "view_materials"
  | "manage_materials"
  | "view_reports"
  | "issue_material"
  | "return_material"
  | "view_transactions"
  | "view_machines"
  | "manage_machines"
  | "reset_password";

const PERMISSION_MATRIX: Record<Action, UserRole[]> = {
  view_employees: ["super_admin"],
  create_employee: ["super_admin"],
  edit_employee: ["super_admin"],
  delete_employee: ["super_admin"],
  approve_employee: ["super_admin"],
  reset_password: ["super_admin"],

  view_materials: ["super_admin", "store_manager", "supervisor", "worker"],
  manage_materials: ["super_admin", "store_manager"],

  issue_material: ["super_admin", "store_manager", "supervisor"],
  return_material: ["super_admin", "store_manager", "supervisor"],
  view_transactions: ["super_admin", "store_manager"],

  view_reports: ["super_admin", "store_manager"],

  view_machines: ["super_admin"],
  manage_machines: ["super_admin"],
};

export function hasPermission(
  role: UserRole | undefined | null,
  action: Action
): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[action]?.includes(role) ?? false;
}
