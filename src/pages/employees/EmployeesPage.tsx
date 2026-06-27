import { useState, useMemo } from "react";

import { toast } from "sonner";
import {
  UserPlus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeForm from "@/components/employees/EmployeeForm";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";
import ResetPasswordDialog from "@/components/employees/ResetPasswordDialog";

import { useEmployees } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";

import { generateNextEmployeeCode } from "@/lib/generateEmployeeCode";

import type { Employee } from "@/types/employee";
import type {
  EmployeeCreateFormData,
  EmployeeEditFormData,
} from "@/lib/validators";

export default function EmployeesPage() {
  const {
    employees,
    loading,
    mutating,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
  } = useEmployees();

  const { can } = usePermissions();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  // Search / filter
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const query = search.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.full_name.toLowerCase().includes(query) ||
        emp.employee_code.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
  }, [employees, search]);

  // Stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.is_active).length;
    const inactive = total - active;
    const roles = new Set(employees.map((e) => e.role)).size;
    return { total, active, inactive, roles };
  }, [employees]);

  // Next employee code
  const nextCode = useMemo(
    () =>
      generateNextEmployeeCode(
        employees.map((e) => e.employee_code)
      ),
    [employees]
  );

  // Handlers
  async function handleCreate(data: EmployeeCreateFormData) {
    try {
      await createEmployee(data);
      setCreateOpen(false);
      toast.success("Employee created successfully", {
        description: `${data.full_name} has been added to the system.`,
      });
    } catch (err: any) {
      toast.error("Failed to create employee", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  async function handleEdit(data: EmployeeEditFormData) {
    if (!selectedEmployee) return;
    try {
      await updateEmployee(selectedEmployee.id, data);
      setEditOpen(false);
      setSelectedEmployee(null);
      toast.success("Employee updated successfully", {
        description: `${data.full_name}'s profile has been updated.`,
      });
    } catch (err: any) {
      toast.error("Failed to update employee", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  function handleEditClick(employee: Employee) {
    setSelectedEmployee(employee);
    setEditOpen(true);
  }

  function handleToggleActiveClick(employee: Employee) {
    setSelectedEmployee(employee);
    setDeleteOpen(true);
  }

  function handleResetPasswordClick(employee: Employee) {
    setSelectedEmployee(employee);
    setResetPasswordOpen(true);
  }

  async function handleConfirmToggle() {
    if (!selectedEmployee) return;
    try {
      if (selectedEmployee.is_active) {
        await deactivateEmployee(selectedEmployee.id);
        toast.success("Employee deactivated", {
          description: `${selectedEmployee.full_name} has been deactivated.`,
        });
      } else {
        await reactivateEmployee(selectedEmployee.id);
        toast.success("Employee reactivated", {
          description: `${selectedEmployee.full_name} has been reactivated.`,
        });
      }
      setDeleteOpen(false);
      setSelectedEmployee(null);
    } catch (err: any) {
      toast.error("Operation failed", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Skeleton header */}
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Skeleton stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border bg-muted/30"
              />
            ))}
          </div>

          {/* Skeleton table */}
          <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Employees
            </h1>
            <p className="text-muted-foreground">
              Manage employee accounts and access control.
            </p>
          </div>

          {can("create_employee") && (
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Employees"
            value={stats.total}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5" />}
            label="Active"
            value={stats.active}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={<UserX className="h-5 w-5" />}
            label="Inactive"
            value={stats.inactive}
            accent="bg-red-500/10 text-red-600 dark:text-red-400"
          />
          <StatCard
            icon={<Shield className="h-5 w-5" />}
            label="Roles in Use"
            value={stats.roles}
            accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          canEdit={can("edit_employee")}
          canDelete={can("delete_employee")}
          canResetPassword={can("reset_password")}
          onEdit={handleEditClick}
          onToggleActive={handleToggleActiveClick}
          onResetPassword={handleResetPasswordClick}
        />

        {/* Create Dialog */}
        <EmployeeForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          nextEmployeeCode={nextCode}
          onSubmit={handleCreate}
          loading={mutating}
        />

        {/* Edit Dialog */}
        {selectedEmployee && editOpen && (
          <EmployeeForm
            mode="edit"
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setSelectedEmployee(null);
            }}
            employee={selectedEmployee}
            onSubmit={handleEdit}
            loading={mutating}
          />
        )}

        {/* Deactivate/Reactivate Confirmation */}
        <DeleteEmployeeDialog
          employee={selectedEmployee}
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setSelectedEmployee(null);
          }}
          onConfirm={handleConfirmToggle}
          loading={mutating}
        />

        {/* Reset Password Dialog */}
        <ResetPasswordDialog
          employee={selectedEmployee}
          isOpen={resetPasswordOpen}
          onClose={() => {
            setResetPasswordOpen(false);
            setSelectedEmployee(null);
          }}
        />
      </div>
    </AppLayout>
  );
}

/* ─── Stat Card Sub-component ─── */

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}