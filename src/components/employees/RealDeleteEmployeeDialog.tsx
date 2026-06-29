import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";

import type { Employee } from "@/types/employee";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function RealDeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: Props) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to permanently delete {employee.full_name}? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{employee.full_name}</span>
            <span className="text-muted-foreground">Code</span>
            <span className="font-mono font-medium">{employee.employee_code}</span>
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{employee.email}</span>
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">{employee.role.replace("_", " ")}</span>
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
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
