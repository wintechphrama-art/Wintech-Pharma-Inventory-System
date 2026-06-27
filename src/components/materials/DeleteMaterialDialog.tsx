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

import type { Material } from "@/types/material";

interface Props {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteMaterialDialog({
  material,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: Props) {
  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <DialogTitle>Delete Material</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to permanently delete {material.material_type} — {material.material_size}? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{material.material_type}</span>
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{material.material_size}</span>
            <span className="text-muted-foreground">Current Stock</span>
            <span className="font-mono font-medium">
              {Number(material.current_quantity).toLocaleString()}{" "}
              {material.unit}
            </span>
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
