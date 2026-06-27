import { supabase } from "./client";
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
}

export async function deactivateMachine(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("machines")
    .update({ status: false })
    .eq("id", id);

  if (error) throw error;
}

export async function reactivateMachine(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("machines")
    .update({ status: true })
    .eq("id", id);

  if (error) throw error;
}
