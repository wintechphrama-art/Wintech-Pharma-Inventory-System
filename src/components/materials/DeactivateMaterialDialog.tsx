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

import type { Material } from "@/types/material";
import { formatQuantity } from "@/lib/utils";

interface Props {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeactivateMaterialDialog({
  material,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: Props) {
  if (!material) return null;

  const isDeactivate = material.status;
  const title = isDeactivate
    ? "Deactivate Material"
    : "Reactivate Material";
  const description = isDeactivate
    ? `Are you sure you want to deactivate ${material.material_type} — ${material.material_size}? It will no longer appear in issue forms.`
    : `Are you sure you want to reactivate ${material.material_type} — ${material.material_size}? It will be available for transactions again.`;

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
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{material.material_type}</span>
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{material.material_size}</span>
            <span className="text-muted-foreground">Current Stock</span>
            <span className="font-mono font-medium">
              {formatQuantity(material.current_quantity)}{" "}
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
