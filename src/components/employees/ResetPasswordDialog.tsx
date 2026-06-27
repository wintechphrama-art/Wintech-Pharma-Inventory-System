import { useState } from "react";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";

interface ResetPasswordDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  employee,
  isOpen,
  onClose,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const { resetPassword, mutating } = useEmployees();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError("");
      await resetPassword(employee.id, newPassword);
      setNewPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleReset}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{employee?.full_name}</strong>.
              They will be able to log in immediately with this new password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="text"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="off"
                disabled={mutating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutating}>
              {mutating ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
