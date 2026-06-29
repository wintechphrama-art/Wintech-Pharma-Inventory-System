import { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2, Plus, Minus, Search, PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Material } from "@/types/material";
import {
  restockSchema,
  type RestockFormData,
} from "@/lib/validators";
import { formatQuantity } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  /** If provided, the material is pre-selected and the dropdown is disabled */
  preselectedMaterial?: Material | null;
  onSubmit: (data: RestockFormData) => Promise<void>;
  loading?: boolean;
}

export default function RestockMaterialDialog({
  open,
  onOpenChange,
  materials,
  preselectedMaterial,
  onSubmit,
  loading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RestockFormData>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      material_id: preselectedMaterial?.id ?? "",
      quantity: 0,
      remarks: "",
    },
  });

  const selectedId = watch("material_id");

  // Active materials only
  const activeMaterials = useMemo(
    () => materials.filter((m) => m.status),
    [materials]
  );

  // Filter materials by search query
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return activeMaterials;
    const q = searchQuery.toLowerCase();
    return activeMaterials.filter(
      (m) =>
        m.material_type.toLowerCase().includes(q) ||
        m.material_size.toLowerCase().includes(q) ||
        (m.vendor && m.vendor.toLowerCase().includes(q))
    );
  }, [activeMaterials, searchQuery]);

  // Currently selected material object
  const selectedMaterial = useMemo(
    () => activeMaterials.find((m) => m.id === selectedId) ?? null,
    [activeMaterials, selectedId]
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        material_id: preselectedMaterial?.id ?? "",
        quantity: 0,
        remarks: "",
      });
      setSearchQuery("");
    }
  }, [open, preselectedMaterial, reset]);

  const isPreselected = !!preselectedMaterial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-emerald-600" />
            Restock Material
          </DialogTitle>
          <DialogDescription>
            Add stock quantity to an existing material.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Material Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Material
            </label>

            {isPreselected ? (
              /* Pre-selected: show as read-only card */
              <div className="rounded-lg border bg-muted/50 px-3 py-2.5 text-sm">
                <span className="font-medium">
                  {preselectedMaterial.material_type}
                </span>
                <span className="text-muted-foreground">
                  {" "}— {preselectedMaterial.material_size}
                </span>
              </div>
            ) : (
              /* Searchable material list */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  {filteredMaterials.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No materials found
                    </div>
                  ) : (
                    filteredMaterials.map((m) => {
                      const isSelected = selectedId === m.id;
                      const isLow =
                        Number(m.current_quantity) <=
                        Number(m.minimum_stock);

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setValue("material_id", m.id, {
                              shouldValidate: true,
                            })
                          }
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-muted/80 ${
                            isSelected
                              ? "bg-primary/10 font-medium"
                              : ""
                          }`}
                        >
                          <div>
                            <span className="font-medium">
                              {m.material_type}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}— {m.material_size}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono ${
                                isLow
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatQuantity(m.current_quantity)}{" "}
                              {m.unit}
                            </span>
                            {isLow && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                                Low
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {errors.material_id && (
              <p className="mt-1 text-sm text-destructive">
                {errors.material_id.message}
              </p>
            )}
          </div>

          {/* Current Stock Info (shows when a material is selected) */}
          {selectedMaterial && (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">
                  Current Stock
                </span>
                <span className="font-mono font-medium">
                  {formatQuantity(selectedMaterial.current_quantity)}{" "}
                  {selectedMaterial.unit}
                </span>
                <span className="text-muted-foreground">
                  Minimum Stock
                </span>
                <span className="font-mono text-muted-foreground">
                  {formatQuantity(selectedMaterial.minimum_stock)}{" "}
                  {selectedMaterial.unit}
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Quantity to Add
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = getValues("quantity") || 0;
                  if (current > 1)
                    setValue("quantity", current - 1, {
                      shouldValidate: true,
                    });
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                step="0.01"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="e.g. 50"
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = getValues("quantity") || 0;
                  setValue("quantity", current + 1, {
                    shouldValidate: true,
                  });
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.quantity && (
              <p className="mt-1 text-sm text-destructive">
                {errors.quantity.message}
              </p>
            )}

            {/* Preview new total */}
            {selectedMaterial && watch("quantity") > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                New total:{" "}
                <span className="font-mono font-medium text-foreground">
                  {formatQuantity(
                    Number(selectedMaterial.current_quantity) +
                      (watch("quantity") || 0)
                  )}{" "}
                  {selectedMaterial.unit}
                </span>
              </p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Remarks{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              {...register("remarks")}
              placeholder="e.g. PO #1234, vendor delivery"
            />
            {errors.remarks && (
              <p className="mt-1 text-sm text-destructive">
                {errors.remarks.message}
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
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Restock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
