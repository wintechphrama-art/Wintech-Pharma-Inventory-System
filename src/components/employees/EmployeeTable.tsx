import { Users } from "lucide-react";

import type { Employee } from "@/types/employee";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import EmployeeRoleBadge from "./EmployeeRoleBadge";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeActions from "./EmployeeActions";

import { formatDate } from "@/utils/formatDate";

interface Props {
  employees: Employee[];
  canEdit: boolean;
  canDelete: boolean;
  canResetPassword?: boolean;
  onEdit: (employee: Employee) => void;
  onToggleActive: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  canEdit,
  canDelete,
  canResetPassword = false,
  onEdit,
  onToggleActive,
  onDelete,
  onResetPassword,
}: Props) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No employees found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding your first employee.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[120px]">
              Employee ID
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">
              Joined
            </TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="w-[60px] text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((employee) => (
            <TableRow
              key={employee.id}
              className="transition-colors"
            >
              <TableCell className="font-mono text-sm font-medium">
                {employee.employee_code}
              </TableCell>

              <TableCell className="font-medium">
                {employee.full_name}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {employee.email}
              </TableCell>

              <TableCell>
                <EmployeeRoleBadge role={employee.role} />
              </TableCell>

              <TableCell>
                <EmployeeStatusBadge isActive={employee.is_active} />
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(employee.created_at)}
              </TableCell>

              {(canEdit || canDelete) && (
                <TableCell className="text-right">
                  <EmployeeActions
                    employee={employee}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canResetPassword={canResetPassword}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                    onResetPassword={onResetPassword}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}