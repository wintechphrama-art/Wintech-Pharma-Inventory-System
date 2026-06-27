export type UserRole =
  | "super_admin"
  | "store_manager"
  | "supervisor"
  | "worker";

export const ROLES: UserRole[] = [
  "worker",
  "supervisor",
  "store_manager",
  "super_admin",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  store_manager: "Store Manager",
  supervisor: "Supervisor",
  worker: "Worker",
};

export interface UserProfile {
  id: string;
  employee_code: string;
  email: string;
  full_name: string;
  department: string | null;
  role: UserRole;
  is_active: boolean;
}