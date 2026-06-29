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
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, employee_code");

  if (profilesError) throw profilesError;

  const profilesMap = new Map(profilesData.map((p) => [p.id, p]));

  const logs = (data ?? []).map((log) => ({
    ...log,
    user: log.user_id ? profilesMap.get(log.user_id) : null,
  }));

  return logs as AuditLog[];
}
