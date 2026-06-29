import { supabase } from "./client";
import { logAction } from "./audit";
import type {
  Machine,
  CreateMachineInput,
  UpdateMachineInput,
} from "@/types/machine";

export async function getMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("machine_name");

  if (error) throw error;

  return data as Machine[];
}

export async function getMachineById(
  id: string
): Promise<Machine | null> {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Machine | null;
}

export async function createMachine(
  input: CreateMachineInput
): Promise<Machine> {
  const { data, error } = await supabase
    .from("machines")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  await logAction({
    action: "CREATE",
    entity_type: "Machine",
    entity_id: data.id,
    details: { machine_code: data.machine_code, machine_name: data.machine_name },
  });

  return data as Machine;
}

export async function updateMachine(
  id: string,
  input: UpdateMachineInput
): Promise<void> {
  const { error } = await supabase
    .from("machines")
    .update(input)
    .eq("id", id);

  if (error) throw error;

  await logAction({
    action: "UPDATE",
    entity_type: "Machine",
    entity_id: id,
    details: input,
  });
}

export async function deactivateMachine(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("machines")
    .update({ status: false })
    .eq("id", id);

  if (error) throw error;

  await logAction({
    action: "DEACTIVATE",
    entity_type: "Machine",
    entity_id: id,
  });
}

export async function reactivateMachine(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("machines")
    .update({ status: true })
    .eq("id", id);

  if (error) throw error;

  await logAction({
    action: "REACTIVATE",
    entity_type: "Machine",
    entity_id: id,
  });
}

/**
 * Permanently delete a machine from the database.
 */
export async function deleteMachine(id: string): Promise<void> {
  const { error, count } = await supabase
    .from("machines")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  if (count === 0) {
    throw new Error("Deletion blocked by database permissions (RLS) or machine not found.");
  }

  await logAction({
    action: "DELETE",
    entity_type: "Machine",
    entity_id: id,
  });
}
