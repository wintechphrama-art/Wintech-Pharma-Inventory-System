import { useEffect, useState, useCallback } from "react";

import type {
  Material,
  CreateMaterialInput,
  UpdateMaterialInput,
} from "@/types/material";

import {
  getMaterials,
  createMaterial as createMaterialService,
  updateMaterial as updateMaterialService,
  deactivateMaterial as deactivateMaterialService,
  reactivateMaterial as reactivateMaterialService,
  deleteMaterial as deleteMaterialService,
} from "@/services/supabase/materials";

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMaterials();
      setMaterials(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createMaterial(data: CreateMaterialInput) {
    setMutating(true);
    try {
      const result = await createMaterialService(data);
      await loadMaterials();
      return result;
    } finally {
      setMutating(false);
    }
  }

  async function updateMaterial(
    id: string,
    data: UpdateMaterialInput
  ) {
    setMutating(true);
    try {
      await updateMaterialService(id, data);
      await loadMaterials();
    } finally {
      setMutating(false);
    }
  }

  async function deactivateMaterial(id: string) {
    setMutating(true);
    try {
      await deactivateMaterialService(id);
      await loadMaterials();
    } finally {
      setMutating(false);
    }
  }

  async function reactivateMaterial(id: string) {
    setMutating(true);
    try {
      await reactivateMaterialService(id);
      await loadMaterials();
    } finally {
      setMutating(false);
    }
  }

  async function deleteMaterial(id: string) {
    setMutating(true);
    try {
      await deleteMaterialService(id);
      await loadMaterials();
    } finally {
      setMutating(false);
    }
  }

  return {
    materials,
    loading,
    mutating,
    refresh: loadMaterials,
    createMaterial,
    updateMaterial,
    deactivateMaterial,
    reactivateMaterial,
    deleteMaterial,
  };
}
