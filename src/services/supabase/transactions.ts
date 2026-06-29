import { supabase } from "./client";
import { logAction } from "./audit";
import type {
  MaterialTransaction,
  CreateTransactionInput,
  MaterialReturn,
  CreateReturnInput,
} from "@/types/transaction";

/**
 * Helper to fetch all join-related tables concurrently.
 */
async function fetchJoinData() {
  const [matsRes, profilesRes, machinesRes] = await Promise.all([
    supabase.from("materials").select("id, material_type, material_size, unit"),
    supabase.from("profiles").select("id, full_name, employee_code"),
    supabase.from("machines").select("id, machine_code, machine_name"),
  ]);

  if (matsRes.error) throw matsRes.error;
  if (profilesRes.error) throw profilesRes.error;
  if (machinesRes.error) throw machinesRes.error;

  return {
    materialsMap: new Map(matsRes.data.map((m) => [m.id, m])),
    profilesMap: new Map(profilesRes.data.map((p) => [p.id, p])),
    machinesMap: new Map(machinesRes.data.map((m) => [m.id, m])),
  };
}

/**
 * Helper to map database transaction row to frontend type.
 */
function mapTransaction(
  t: any,
  materialsMap: Map<string, any>,
  profilesMap: Map<string, any>,
  machinesMap: Map<string, any>
): MaterialTransaction {
  return {
    ...t,
    material: materialsMap.get(t.material_id),
    employee: profilesMap.get(t.employee_id),
    machine: t.machine_id ? machinesMap.get(t.machine_id) : null,
    creator: t.created_by ? profilesMap.get(t.created_by) : null,
  };
}

/**
 * Fetch all material transactions with joined relations.
 */
export async function getTransactions(): Promise<MaterialTransaction[]> {
  const { data, error } = await supabase
    .from("material_transactions")
    .select("*")
    .order("issued_at", { ascending: false });

  if (error) throw error;

  const { materialsMap, profilesMap, machinesMap } = await fetchJoinData();

  const transactions = (data ?? []).map((t) =>
    mapTransaction(t, materialsMap, profilesMap, machinesMap)
  );

  return transactions;
}

/**
 * Fetch transactions for a specific material.
 */
export async function getTransactionsByMaterial(
  materialId: string
): Promise<MaterialTransaction[]> {
  const { data, error } = await supabase
    .from("material_transactions")
    .select("*")
    .eq("material_id", materialId)
    .order("issued_at", { ascending: false });

  if (error) throw error;

  const { materialsMap, profilesMap, machinesMap } = await fetchJoinData();

  const transactions = (data ?? []).map((t) =>
    mapTransaction(t, materialsMap, profilesMap, machinesMap)
  );

  return transactions;
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
    .select("*")
    .single();

  if (error) throw error;

  const { materialsMap, profilesMap, machinesMap } = await fetchJoinData();
  const result = mapTransaction(data, materialsMap, profilesMap, machinesMap);

  await logAction({
    action: "ISSUE",
    entity_type: "Transaction",
    entity_id: result.id,
    details: {
      material_id: input.material_id,
      employee_id: input.employee_id,
      quantity: input.quantity_issued,
    },
  });

  return result;
}

/**
 * Fetch all material returns with joined transaction data.
 */
export async function getReturns(): Promise<MaterialReturn[]> {
  const { data, error } = await supabase
    .from("material_returns")
    .select("*")
    .order("returned_at", { ascending: false });

  if (error) throw error;

  const [txnsRes, joinData] = await Promise.all([
    supabase.from("material_transactions").select("*"),
    fetchJoinData(),
  ]);

  if (txnsRes.error) throw txnsRes.error;

  const { materialsMap, profilesMap, machinesMap } = joinData;

  const txnsMap = new Map(
    txnsRes.data.map((t) => [
      t.id,
      mapTransaction(t, materialsMap, profilesMap, machinesMap),
    ])
  );

  const returns = (data ?? []).map((r) => ({
    ...r,
    transaction: txnsMap.get(r.transaction_id),
    creator: r.created_by ? profilesMap.get(r.created_by) : null,
  }));

  return returns as MaterialReturn[];
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
    .select("*")
    .single();

  if (error) throw error;

  const [txnRes, joinData] = await Promise.all([
    supabase
      .from("material_transactions")
      .select("*")
      .eq("id", input.transaction_id)
      .single(),
    fetchJoinData(),
  ]);

  if (txnRes.error) throw txnRes.error;

  const { materialsMap, profilesMap, machinesMap } = joinData;
  const txn = mapTransaction(txnRes.data, materialsMap, profilesMap, machinesMap);

  const result = {
    ...data,
    transaction: txn,
    creator: data.created_by ? profilesMap.get(data.created_by) : null,
  };

  await logAction({
    action: "RETURN",
    entity_type: "Transaction",
    entity_id: data.id,
    details: {
      transaction_id: input.transaction_id,
      quantity: input.quantity_returned,
    },
  });

  return result as MaterialReturn;
}
