import { useState } from "react";

import { Loader2, Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Material } from "@/types/material";
import type { Employee } from "@/types/employee";
import type { Machine } from "@/types/machine";
import { formatQuantity } from "@/lib/utils";

interface Props {
  materials: Material[];
  employees: Employee[];
  machines: Machine[];
  onSubmit: (data: {
    material_id: string;
    employee_id: string;
    quantity_issued: number;
    machine_id?: string | null;
    custom_purpose?: string | null;
    remarks?: string | null;
  }) => Promise<void>;
  loading?: boolean;
}

export default function IssueMaterialForm({
  materials,
  employees,
  machines,
  onSubmit,
  loading = false,
}: Props) {
  const [materialId, setMaterialId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purposeType, setPurposeType] = useState<"machine" | "custom">(
    "machine"
  );
  const [machineId, setMachineId] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected material for stock info
  const selectedMaterial = materials.find((m) => m.id === materialId);

  // Only show active materials and employees
  const activeMaterials = materials.filter((m) => m.status);
  const activeEmployees = employees;
  const activeMachines = machines.filter((m) => m.status);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!materialId) newErrors.material = "Please select a material";
    if (!employeeId) newErrors.employee = "Please select an employee";

    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      newErrors.quantity = "Enter a valid quantity greater than 0";
    } else if (
      selectedMaterial &&
      qty > Number(selectedMaterial.current_quantity)
    ) {
      newErrors.quantity = `Only ${formatQuantity(selectedMaterial.current_quantity)} ${selectedMaterial.unit} available`;
    }

    if (purposeType === "machine" && !machineId) {
      newErrors.machine = "Please select a machine";
    }
    if (purposeType === "custom" && !customPurpose.trim()) {
      newErrors.purpose = "Please enter a purpose";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      material_id: materialId,
      employee_id: employeeId,
      quantity_issued: parseFloat(quantity),
      machine_id: purposeType === "machine" ? machineId : null,
      custom_purpose:
        purposeType === "custom" ? customPurpose.trim() : null,
      remarks: remarks.trim() || null,
    });

    // Reset form
    setMaterialId("");
    setEmployeeId("");
    setQuantity("");
    setMachineId("");
    setCustomPurpose("");
    setRemarks("");
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Material */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Material
        </label>
        <Select value={materialId} onValueChange={setMaterialId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a material" />
          </SelectTrigger>
          <SelectContent>
            {activeMaterials.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.material_type} — {m.material_size}{" "}
                <span className="text-muted-foreground">
                  ({formatQuantity(m.current_quantity)} {m.unit})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.material && (
          <p className="mt-1 text-sm text-destructive">
            {errors.material}
          </p>
        )}
        {selectedMaterial && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Available Stock
              </span>
              <span
                className={`font-mono font-medium ${
                  Number(selectedMaterial.current_quantity) <=
                  Number(selectedMaterial.minimum_stock)
                    ? "text-amber-600 dark:text-amber-400"
                    : ""
                }`}
              >
                {formatQuantity(
                  selectedMaterial.current_quantity
                )}{" "}
                {selectedMaterial.unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Employee */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Issue To (Employee)
        </label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {activeEmployees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.full_name}{" "}
                <span className="text-muted-foreground">
                  ({e.employee_code})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employee && (
          <p className="mt-1 text-sm text-destructive">
            {errors.employee}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Quantity
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const current = parseFloat(quantity) || 0;
              if (current > 1) setQuantity((current - 1).toString());
              else if (current > 0) setQuantity("");
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Enter quantity${selectedMaterial ? ` in ${selectedMaterial.unit}` : ""}`}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const current = parseFloat(quantity) || 0;
              setQuantity((current + 1).toString());
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.quantity && (
          <p className="mt-1 text-sm text-destructive">
            {errors.quantity}
          </p>
        )}
      </div>

      {/* Purpose Type Toggle */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Purpose
        </label>
        <div className="mb-3 flex gap-2">
          <Button
            type="button"
            variant={purposeType === "machine" ? "default" : "outline"}
            size="sm"
            onClick={() => setPurposeType("machine")}
          >
            For Machine
          </Button>
          <Button
            type="button"
            variant={purposeType === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setPurposeType("custom")}
          >
            Custom Purpose
          </Button>
        </div>

        {purposeType === "machine" ? (
          <>
            <Select value={machineId} onValueChange={setMachineId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a machine" />
              </SelectTrigger>
              <SelectContent>
                {activeMachines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.machine_name}
                    {m.machine_code && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({m.machine_code})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.machine && (
              <p className="mt-1 text-sm text-destructive">
                {errors.machine}
              </p>
            )}
          </>
        ) : (
          <>
            <Input
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="e.g. Maintenance work, General repair"
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-destructive">
                {errors.purpose}
              </p>
            )}
          </>
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
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any additional notes..."
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Issue Material
      </Button>
    </form>
  );
}
