/**
 * A material transaction (issue) as stored in `material_transactions`.
 * Joined fields (material_name, employee_name, etc.) are populated
 * via Supabase select joins.
 */
export interface MaterialTransaction {
  id: string;
  material_id: string;
  employee_id: string;
  quantity_issued: number;
  machine_id: string | null;
  custom_purpose: string | null;
  remarks: string | null;
  issued_at: string;
  created_by: string | null;

  // Joined relations (populated via select)
  material?: {
    material_type: string;
    material_size: string;
    unit: string;
  };
  employee?: {
    full_name: string;
    employee_code: string;
  };
  machine?: {
    machine_code: string | null;
    machine_name: string;
  } | null;
  creator?: {
    full_name: string;
    employee_code: string;
  } | null;
}

export interface CreateTransactionInput {
  material_id: string;
  employee_id: string;
  quantity_issued: number;
  machine_id?: string | null;
  custom_purpose?: string | null;
  remarks?: string | null;
}

/**
 * A material return as stored in `material_returns`.
 */
export interface MaterialReturn {
  id: string;
  transaction_id: string;
  quantity_returned: number;
  remarks: string | null;
  returned_at: string;
  created_by: string | null;

  // Joined relations
  transaction?: MaterialTransaction;
  creator?: {
    full_name: string;
    employee_code: string;
  } | null;
}

export interface CreateReturnInput {
  transaction_id: string;
  quantity_returned: number;
  remarks?: string | null;
}
