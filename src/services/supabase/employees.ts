import { supabase } from "./client";
import type { Employee, UpdateEmployeeInput } from "@/types/employee";
import { logAction } from "./audit";

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

  if (result?.employee?.id) {
    await logAction({
      action: "CREATE",
      entity_type: "Employee",
      entity_id: result.employee.id,
      details: { email: data.email, role: data.role },
    });
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

  await logAction({
    action: "UPDATE",
    entity_type: "Employee",
    entity_id: id,
    details: data,
  });
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

  await logAction({
    action: "DEACTIVATE",
    entity_type: "Employee",
    entity_id: id,
  });
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

  await logAction({
    action: "REACTIVATE",
    entity_type: "Employee",
    entity_id: id,
  });
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

  await logAction({
    action: "RESET_PASSWORD",
    entity_type: "Employee",
    entity_id: targetUserId,
  });
}

/**
 * Permanently delete an employee from the database.
 */
export async function deleteEmployee(id: string): Promise<void> {
  const { error, count } = await supabase
    .from("profiles")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  if (count === 0) {
    throw new Error("Deletion blocked by database permissions (RLS) or employee not found.");
  }

  await logAction({
    action: "DELETE",
    entity_type: "Employee",
    entity_id: id,
  });
}