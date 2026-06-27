import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { AlertTriangle } from "lucide-react";

import type { Employee } from "@/types/employee";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: Props) {
  if (!employee) return null;

  const isDeactivate = employee.is_active;
  const title = isDeactivate
    ? "Deactivate Employee"
    : "Reactivate Employee";
  const description = isDeactivate
    ? `Are you sure you want to deactivate ${employee.full_name}? They will no longer be able to log in or access the system.`
    : `Are you sure you want to reactivate ${employee.full_name}? They will regain access to the system.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isDeactivate
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-emerald-100 dark:bg-emerald-900/30"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  isDeactivate
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              />
            </div>

            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{employee.full_name}</span>
            <span className="text-muted-foreground">Code</span>
            <span className="font-medium">{employee.employee_code}</span>
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{employee.email}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={isDeactivate ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isDeactivate
                ? "Deactivate"
                : "Reactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
