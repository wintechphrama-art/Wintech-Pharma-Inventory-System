import { useState } from "react";

import {
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  Lock,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Employee } from "@/types/employee";

interface Props {
  employee: Employee;
  canEdit: boolean;
  canDelete: boolean;
  canResetPassword?: boolean;
  onEdit: (employee: Employee) => void;
  onToggleActive: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

export default function EmployeeActions({
  employee,
  canEdit,
  canDelete,
  canResetPassword = false,
  onEdit,
  onToggleActive,
  onDelete,
  onResetPassword,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onEdit(employee);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Employee
          </DropdownMenuItem>
        )}

        {canResetPassword && onResetPassword && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onResetPassword(employee);
            }}
          >
            <Lock className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
        )}

        {canEdit && canDelete && <DropdownMenuSeparator />}

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onToggleActive(employee);
            }}
            className={
              employee.is_active
                ? "text-destructive focus:text-destructive"
                : "text-emerald-600 focus:text-emerald-600"
            }
          >
            {employee.is_active ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onDelete(employee);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Employee
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
