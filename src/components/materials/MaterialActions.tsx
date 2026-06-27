import { useState } from "react";

import {
  MoreHorizontal,
  Pencil,
  XCircle,
  CheckCircle,
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

import type { Material } from "@/types/material";

interface Props {
  material: Material;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (material: Material) => void;
  onToggleActive: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export default function MaterialActions({
  material,
  canEdit,
  canDelete,
  onEdit,
  onToggleActive,
  onDelete,
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
              onEdit(material);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Material
          </DropdownMenuItem>
        )}

        {canEdit && canDelete && <DropdownMenuSeparator />}

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onToggleActive(material);
            }}
            className={
              material.status
                ? "text-destructive focus:text-destructive"
                : "text-emerald-600 focus:text-emerald-600"
            }
          >
            {material.status ? (
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

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onDelete(material);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Material
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
