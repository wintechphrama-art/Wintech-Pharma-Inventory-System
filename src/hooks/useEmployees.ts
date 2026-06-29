import { useEffect, useState, useCallback } from "react";

import type { Employee, UpdateEmployeeInput } from "@/types/employee";

import {
  getEmployees,
  createEmployee as createEmployeeService,
  updateEmployee as updateEmployeeService,
  deactivateEmployee as deactivateEmployeeService,
  reactivateEmployee as reactivateEmployeeService,
  resetEmployeePassword as resetEmployeePasswordService,
  deleteEmployee as deleteEmployeeService,
} from "@/services/supabase/employees";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createEmployee(data: {
    full_name: string;
    email: string;
    role: string;
    password: string;
  }) {
    setMutating(true);
    try {
      const result = await createEmployeeService(data);
      await loadEmployees();
      return result;
    } finally {
      setMutating(false);
    }
  }

  async function updateEmployee(
    id: string,
    data: UpdateEmployeeInput
  ) {
    setMutating(true);
    try {
      await updateEmployeeService(id, data);
      await loadEmployees();
    } finally {
      setMutating(false);
    }
  }

  async function deactivateEmployee(id: string) {
    setMutating(true);
    try {
      await deactivateEmployeeService(id);
      await loadEmployees();
    } finally {
      setMutating(false);
    }
  }

  async function reactivateEmployee(id: string) {
    setMutating(true);
    try {
      await reactivateEmployeeService(id);
      await loadEmployees();
    } finally {
      setMutating(false);
    }
  }

  async function deleteEmployee(id: string) {
    setMutating(true);
    try {
      await deleteEmployeeService(id);
      await loadEmployees();
    } finally {
      setMutating(false);
    }
  }

  async function resetPassword(id: string, newPassword: string) {
    setMutating(true);
    try {
      await resetEmployeePasswordService(id, newPassword);
    } finally {
      setMutating(false);
    }
  }

  return {
    employees,
    loading,
    mutating,
    refresh: loadEmployees,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
    resetPassword,
    deleteEmployee,
  };
}