import { supabase } from "./client";
import type { AuditLog, CreateAuditLogInput } from "@/types/audit";

export async function logAction(input: Omit<CreateAuditLogInput, "user_id">): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return;

  const { error } = await supabase.from("audit_logs").insert([{ ...input, user_id: user.id }]);
  if (error) {
    console.error("Failed to insert audit log:", error);
    // We typically don't throw an error here to prevent blocking the main action,
    // but we log it to the console for debugging.
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      *,
      user:profiles!audit_logs_user_id_fkey(full_name, employee_code)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data as AuditLog[];
}
