import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MATERIAL_UNITS } from "@/lib/constants";
import type { Material } from "@/types/material";
import {
  materialCreateSchema,
  materialEditSchema,
  type MaterialCreateFormData,
  type MaterialEditFormData,
} from "@/lib/validators";

/* ──────────────── Create Mode ──────────────── */

function CreateMaterialForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MaterialCreateFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialCreateFormData>({
    resolver: zodResolver(materialCreateSchema),
    defaultValues: {
      material_type: "",
      material_size: "",
      unit: "Nos",
      minimum_stock: 0,
      current_quantity: 0,
      location: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        material_type: "",
        material_size: "",
        unit: "Nos",
        minimum_stock: 0,
        current_quantity: 0,
        location: "",
      });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Add a new material to the inventory system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Material Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Material Type
            </label>
            <Input
              {...register("material_type")}
              placeholder="e.g. Bolt, Bearing, Pipe"
            />
            {errors.material_type && (
              <p className="mt-1 text-sm text-destructive">
                {errors.material_type.message}
              </p>
            )}
          </div>

          {/* Material Size */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Size / Specification
            </label>
            <Input
              {...register("material_size")}
              placeholder="e.g. M8x20, 2 inch, 10mm"
            />
            {errors.material_size && (
              <p className="mt-1 text-sm text-destructive">
                {errors.material_size.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Unit
            </label>
            <Select
              value={watch("unit")}
              onValueChange={(value) =>
                setValue("unit", value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="mt-1 text-sm text-destructive">
                {errors.unit.message}
              </p>
            )}
          </div>

          {/* Minimum Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Stock Level
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("minimum_stock", { valueAsNumber: true })}
              placeholder="e.g. 10"
            />
            {errors.minimum_stock && (
              <p className="mt-1 text-sm text-destructive">
                {errors.minimum_stock.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Alert threshold — you'll see a warning when stock drops below this.
            </p>
          </div>

          {/* Initial Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Initial Stock Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("current_quantity", { valueAsNumber: true })}
              placeholder="e.g. 100"
            />
            {errors.current_quantity && (
              <p className="mt-1 text-sm text-destructive">
                {errors.current_quantity.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Storage Location
            </label>
            <Input
              {...register("location")}
              placeholder="e.g. Rack A-3, Bin 12"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-destructive">
                {errors.location.message}
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
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Edit Mode ──────────────── */

function EditMaterialForm({
  open,
  onOpenChange,
  material,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  onSubmit: (data: MaterialEditFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialEditFormData>({
    resolver: zodResolver(materialEditSchema),
    defaultValues: {
      material_type: material.material_type,
      material_size: material.material_size,
      unit: material.unit,
      minimum_stock: Number(material.minimum_stock),
      location: material.location ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        material_type: material.material_type,
        material_size: material.material_size,
        unit: material.unit,
        minimum_stock: Number(material.minimum_stock),
        location: material.location ?? "",
      });
    }
  }, [open, material, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update details for{" "}
            <span className="font-medium">
              {material.material_type} — {material.material_size}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Material Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Material Type
            </label>
            <Input
              {...register("material_type")}
              placeholder="e.g. Bolt, Bearing, Pipe"
            />
            {errors.material_type && (
              <p className="mt-1 text-sm text-destructive">
                {errors.material_type.message}
              </p>
            )}
          </div>

          {/* Material Size */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Size / Specification
            </label>
            <Input
              {...register("material_size")}
              placeholder="e.g. M8x20, 2 inch, 10mm"
            />
            {errors.material_size && (
              <p className="mt-1 text-sm text-destructive">
                {errors.material_size.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Unit
            </label>
            <Select
              value={watch("unit")}
              onValueChange={(value) =>
                setValue("unit", value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="mt-1 text-sm text-destructive">
                {errors.unit.message}
              </p>
            )}
          </div>

          {/* Minimum Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Stock Level
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("minimum_stock", { valueAsNumber: true })}
              placeholder="e.g. 10"
            />
            {errors.minimum_stock && (
              <p className="mt-1 text-sm text-destructive">
                {errors.minimum_stock.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Storage Location
            </label>
            <Input
              {...register("location")}
              placeholder="e.g. Rack A-3, Bin 12"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Current Stock (read-only info) */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Current Stock</span>
              <span className="font-mono font-medium">
                {Number(material.current_quantity).toLocaleString()}{" "}
                {material.unit}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Stock quantities are updated through material transactions, not
              by editing directly.
            </p>
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
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Exported Wrapper ──────────────── */

interface CreateProps {
  mode: "create";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MaterialCreateFormData) => Promise<void>;
  loading?: boolean;
}

interface EditProps {
  mode: "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  onSubmit: (data: MaterialEditFormData) => Promise<void>;
  loading?: boolean;
}

type MaterialFormProps = CreateProps | EditProps;

export default function MaterialForm(props: MaterialFormProps) {
  if (props.mode === "create") {
    return (
      <CreateMaterialForm
        open={props.open}
        onOpenChange={props.onOpenChange}
        onSubmit={props.onSubmit}
        loading={props.loading}
      />
    );
  }

  return (
    <EditMaterialForm
      open={props.open}
      onOpenChange={props.onOpenChange}
      material={props.material}
      onSubmit={props.onSubmit}
      loading={props.loading}
    />
  );
}
