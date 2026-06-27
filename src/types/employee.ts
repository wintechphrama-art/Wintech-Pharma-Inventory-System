export type { UserRole } from "./auth";

export interface Employee {
  id: string;
  employee_code: string;
  email: string;
  full_name: string;
  department: string | null;
  role: import("./auth").UserRole;
  is_active: boolean;
  created_at: string;
}

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  role: import("./auth").UserRole;
  password: string;
}

export interface UpdateEmployeeInput {
  full_name?: string;
  email?: string;
  role?: import("./auth").UserRole;
  department?: string | null;
}