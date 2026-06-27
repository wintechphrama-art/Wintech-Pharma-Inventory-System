export interface Machine {
  id: string;
  machine_code: string | null;
  machine_name: string;
  status: boolean;
  created_at: string;
}

export interface CreateMachineInput {
  machine_code?: string | null;
  machine_name: string;
}

export interface UpdateMachineInput {
  machine_code?: string | null;
  machine_name?: string;
}
