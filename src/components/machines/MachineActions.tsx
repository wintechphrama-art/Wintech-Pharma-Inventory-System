import { useState } from "react";

import {
  MoreHorizontal,
  Pencil,
  XCircle,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Machine } from "@/types/machine";

interface Props {
  machine: Machine;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (machine: Machine) => void;
  onToggleActive: (machine: Machine) => void;
}

export default function MachineActions({
  machine,
  canEdit,
  canDelete,
  onEdit,
  onToggleActive,
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
              onEdit(machine);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Machine
          </DropdownMenuItem>
        )}

        {canEdit && canDelete && <DropdownMenuSeparator />}

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onToggleActive(machine);
            }}
            className={
              machine.status
                ? "text-destructive focus:text-destructive"
                : "text-emerald-600 focus:text-emerald-600"
            }
          >
            {machine.status ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
