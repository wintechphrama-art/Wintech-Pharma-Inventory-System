import { supabase } from "./client";
import type {
  Material,
  CreateMaterialInput,
  UpdateMaterialInput,
} from "@/types/material";

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("material_type")
    .order("material_size");

  if (error) throw error;

  return data as Material[];
}

export async function getMaterialById(
  id: string
): Promise<Material | null> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Material | null;
}

export async function createMaterial(
  input: CreateMaterialInput
): Promise<Material> {
  const { data, error } = await supabase
    .from("materials")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data as Material;
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput
): Promise<void> {
  const { error } = await supabase
    .from("materials")
    .update(input)
    .eq("id", id);

  if (error) throw error;
}

/**
 * Deactivate a material by setting status = false.
 */
export async function deactivateMaterial(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("materials")
    .update({ status: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Reactivate a previously deactivated material.
 */
export async function reactivateMaterial(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("materials")
    .update({ status: true })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Get distinct material types for filter dropdowns.
 */
export async function getMaterialTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("material_type")
    .order("material_type");

  if (error) throw error;

  const unique = [
    ...new Set((data ?? []).map((d) => d.material_type)),
  ];

  return unique;
}

/**
 * Permanently delete a material from the database.
 * Note: This will fail if there are foreign key constraints (e.g. existing transactions).
 */
export async function deleteMaterial(id: string): Promise<void> {
  const { error, count } = await supabase
    .from("materials")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  if (count === 0) {
    throw new Error("Deletion blocked by database permissions (RLS) or material not found.");
  }
}
