import { supabase } from "./client";
import type { Employee, UpdateEmployeeInput } from "@/types/employee";

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("employee_code");

  if (error) throw error;

  return data as Employee[];
}

export async function getEmployeeById(
  id: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Employee | null;
}

/**
 * Creates a new employee via the Supabase Edge Function.
 * The Edge Function handles:
 * - Creating the Supabase Auth user
 * - Inserting the profile row
 * - Generating the employee code
 */
export async function createEmployee(data: {
  full_name: string;
  email: string;
  role: string;
  password: string;
}): Promise<{ success: boolean; employee?: Employee; error?: string }> {
  // Get the current session to pass the auth token explicitly
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("You must be logged in to create employees");
  }

  const { data: result, error } = await supabase.functions.invoke(
    "create-employee",
    {
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to create employee");
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return result;
}

/**
 * Updates an employee's profile data directly.
 */
export async function updateEmployee(
  id: string,
  data: UpdateEmployeeInput
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

/**
 * Soft-deletes an employee by setting is_active = false.
 */
export async function deactivateEmployee(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Reactivates a previously deactivated employee.
 */
export async function reactivateEmployee(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Resets an employee's password via the secure RPC function.
 * This function handles hashing using pgcrypto and verifies caller is super_admin.
 */
export async function resetEmployeePassword(
  targetUserId: string,
  newPassword: string
): Promise<void> {
  const { error } = await supabase.rpc("admin_reset_password", {
    target_user_id: targetUserId,
    new_password: newPassword,
  });

  if (error) throw error;
}