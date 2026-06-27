export interface Material {
  id: string;
  material_type: string;
  material_size: string;
  unit: string;
  current_quantity: number;
  minimum_stock: number;
  location: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialInput {
  material_type: string;
  material_size: string;
  unit: string;
  minimum_stock: number;
  current_quantity?: number;
  location?: string | null;
}

export interface UpdateMaterialInput {
  material_type?: string;
  material_size?: string;
  unit?: string;
  minimum_stock?: number;
  location?: string | null;
}
