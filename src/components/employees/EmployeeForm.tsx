import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ROLES, ROLE_LABELS } from "@/types/auth";
import type { Employee } from "@/types/employee";
import type { UserRole } from "@/types/auth";
import {
  employeeCreateSchema,
  employeeEditSchema,
  type EmployeeCreateFormData,
  type EmployeeEditFormData,
} from "@/lib/validators";

/* ──────────────── Create Mode ──────────────── */

function CreateEmployeeForm({
  open,
  onOpenChange,
  nextEmployeeCode,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextEmployeeCode: string;
  onSubmit: (data: EmployeeCreateFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeCreateFormData>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "worker",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        full_name: "",
        email: "",
        role: "worker",
        password: "",
      });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account. They'll receive login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee Code */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Employee Code
            </label>
            <Input
              value={nextEmployeeCode}
              disabled
              className="bg-muted font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Auto-generated and cannot be changed.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <Input
              {...register("full_name")}
              placeholder="e.g. Rahul Sharma"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="e.g. rahul@factory.local"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Role
            </label>
            <Select
              value={watch("role")}
              onValueChange={(value) =>
                setValue("role", value as UserRole, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="mt-1 text-sm text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Temporary Password
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Min. 6 characters"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              The employee should change this after first login.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Edit Mode ──────────────── */

function EditEmployeeForm({
  open,
  onOpenChange,
  employee,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSubmit: (data: EmployeeEditFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeEditFormData>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      full_name: employee.full_name,
      email: employee.email,
      role: employee.role,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
      });
    }
  }, [open, employee, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information for{" "}
            <span className="font-medium">{employee.employee_code}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <Input
              {...register("full_name")}
              placeholder="e.g. Rahul Sharma"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="e.g. rahul@factory.local"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Role
            </label>
            <Select
              value={watch("role")}
              onValueChange={(value) =>
                setValue("role", value as UserRole, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="mt-1 text-sm text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Exported Wrapper ──────────────── */

interface CreateProps {
  mode: "create";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextEmployeeCode: string;
  onSubmit: (data: EmployeeCreateFormData) => Promise<void>;
  loading?: boolean;
}

interface EditProps {
  mode: "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSubmit: (data: EmployeeEditFormData) => Promise<void>;
  loading?: boolean;
}

type EmployeeFormProps = CreateProps | EditProps;

export default function EmployeeForm(props: EmployeeFormProps) {
  if (props.mode === "create") {
    return (
      <CreateEmployeeForm
        open={props.open}
        onOpenChange={props.onOpenChange}
        nextEmployeeCode={props.nextEmployeeCode}
        onSubmit={props.onSubmit}
        loading={props.loading}
      />
    );
  }

  return (
    <EditEmployeeForm
      open={props.open}
      onOpenChange={props.onOpenChange}
      employee={props.employee}
      onSubmit={props.onSubmit}
      loading={props.loading}
    />
  );
}