import { supabase } from "./client";
import { logAction } from "./audit";
import type {
  MaterialTransaction,
  CreateTransactionInput,
  MaterialReturn,
  CreateReturnInput,
} from "@/types/transaction";

/**
 * Fetch all material transactions with joined relations.
 */
export async function getTransactions(): Promise<MaterialTransaction[]> {
  const { data, error } = await supabase
    .from("material_transactions")
    .select(
      `
      *,
      material:materials(material_type, material_size, unit),
      employee:profiles!material_transactions_employee_id_fkey(full_name, employee_code),
      machine:machines(machine_code, machine_name),
      creator:profiles!material_transactions_created_by_fkey(full_name, employee_code)
    `
    )
    .order("issued_at", { ascending: false });

  if (error) throw error;

  return data as MaterialTransaction[];
}

/**
 * Fetch transactions for a specific material.
 */
export async function getTransactionsByMaterial(
  materialId: string
): Promise<MaterialTransaction[]> {
  const { data, error } = await supabase
    .from("material_transactions")
    .select(
      `
      *,
      material:materials(material_type, material_size, unit),
      employee:profiles!material_transactions_employee_id_fkey(full_name, employee_code),
      machine:machines(machine_code, machine_name),
      creator:profiles!material_transactions_created_by_fkey(full_name, employee_code)
    `
    )
    .eq("material_id", materialId)
    .order("issued_at", { ascending: false });

  if (error) throw error;

  return data as MaterialTransaction[];
}

/**
 * Create a material issue transaction.
 * Stock is decremented automatically by the DB trigger.
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<MaterialTransaction> {
  // Get current user for created_by
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("material_transactions")
    .insert({
      ...input,
      created_by: user?.id ?? null,
    })
    .select(
      `
      *,
      material:materials(material_type, material_size, unit),
      employee:profiles!material_transactions_employee_id_fkey(full_name, employee_code),
      machine:machines(machine_code, machine_name),
      creator:profiles!material_transactions_created_by_fkey(full_name, employee_code)
    `
    )
    .single();

  if (error) throw error;

  await logAction({
    action: "ISSUE",
    entity_type: "Transaction",
    entity_id: data.id,
    details: {
      material_id: input.material_id,
      employee_id: input.employee_id,
      quantity: input.quantity_issued,
    },
  });

  return data as MaterialTransaction;
}

/**
 * Fetch all material returns with joined transaction data.
 */
export async function getReturns(): Promise<MaterialReturn[]> {
  const { data, error } = await supabase
    .from("material_returns")
    .select(
      `
      *,
      transaction:material_transactions(
        *,
        material:materials(material_type, material_size, unit),
        employee:profiles!material_transactions_employee_id_fkey(full_name, employee_code),
        machine:machines(machine_code, machine_name)
      ),
      creator:profiles!material_returns_created_by_fkey(full_name, employee_code)
    `
    )
    .order("returned_at", { ascending: false });

  if (error) throw error;

  return data as MaterialReturn[];
}

/**
 * Create a material return.
 * Stock is restored automatically by the DB trigger.
 */
export async function createReturn(
  input: CreateReturnInput
): Promise<MaterialReturn> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("material_returns")
    .insert({
      ...input,
      created_by: user?.id ?? null,
    })
    .select(
      `
      *,
      transaction:material_transactions(
        *,
        material:materials(material_type, material_size, unit),
        employee:profiles!material_transactions_employee_id_fkey(full_name, employee_code),
        machine:machines(machine_code, machine_name)
      ),
      creator:profiles!material_returns_created_by_fkey(full_name, employee_code)
    `
    )
    .single();

  if (error) throw error;

  await logAction({
    action: "RETURN",
    entity_type: "Transaction",
    entity_id: data.id,
    details: {
      transaction_id: input.transaction_id,
      quantity: input.quantity_returned,
    },
  });

  return data as MaterialReturn;
}
