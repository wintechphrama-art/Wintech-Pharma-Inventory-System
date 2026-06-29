import { useEffect, useState, useCallback } from "react";

import type {
  Machine,
  CreateMachineInput,
  UpdateMachineInput,
} from "@/types/machine";

import {
  getMachines,
  createMachine as createMachineService,
  updateMachine as updateMachineService,
  deactivateMachine as deactivateMachineService,
  reactivateMachine as reactivateMachineService,
  deleteMachine as deleteMachineService,
} from "@/services/supabase/machines";

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMachines();
      setMachines(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createMachine(data: CreateMachineInput) {
    setMutating(true);
    try {
      const result = await createMachineService(data);
      await loadMachines();
      return result;
    } finally {
      setMutating(false);
    }
  }

  async function updateMachine(
    id: string,
    data: UpdateMachineInput
  ) {
    setMutating(true);
    try {
      await updateMachineService(id, data);
      await loadMachines();
    } finally {
      setMutating(false);
    }
  }

  async function deactivateMachine(id: string) {
    setMutating(true);
    try {
      await deactivateMachineService(id);
      await loadMachines();
    } finally {
      setMutating(false);
    }
  }

  async function reactivateMachine(id: string) {
    setMutating(true);
    try {
      await reactivateMachineService(id);
      await loadMachines();
    } finally {
      setMutating(false);
    }
  }

  async function deleteMachine(id: string) {
    setMutating(true);
    try {
      await deleteMachineService(id);
      await loadMachines();
    } finally {
      setMutating(false);
    }
  }

  return {
    machines,
    loading,
    mutating,
    refresh: loadMachines,
    createMachine,
    updateMachine,
    deactivateMachine,
    reactivateMachine,
    deleteMachine,
  };
}
