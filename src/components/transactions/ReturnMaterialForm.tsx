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

import type { MaterialTransaction, MaterialReturn } from "@/types/transaction";
import { formatQuantity } from "@/lib/utils";

interface Props {
  transactions: MaterialTransaction[];
  returns?: MaterialReturn[];
  onSubmit: (data: {
    transaction_id: string;
    quantity_returned: number;
    remarks?: string | null;
  }) => Promise<void>;
  loading?: boolean;
}

export default function ReturnMaterialForm({
  transactions,
  returns = [],
  onSubmit,
  loading = false,
}: Props) {
  const [transactionId, setTransactionId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTxn = transactions.find((t) => t.id === transactionId);

  // Helper to calculate how much is left to return for a transaction
  const getRemainingQuantity = (txnId: string, issued: number) => {
    const alreadyReturned = returns
      .filter((r) => r.transaction_id === txnId)
      .reduce((sum, r) => sum + Number(r.quantity_returned), 0);
    return issued - alreadyReturned;
  };

  const selectedMax = selectedTxn 
    ? getRemainingQuantity(selectedTxn.id, Number(selectedTxn.quantity_issued)) 
    : 0;

  // Filter transactions to only show ones that have items left to return
  const availableTransactions = transactions.filter(
    (t) => getRemainingQuantity(t.id, Number(t.quantity_issued)) > 0
  );

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!transactionId)
      newErrors.transaction = "Please select a transaction";

    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      newErrors.quantity = "Enter a valid quantity greater than 0";
    } else if (selectedTxn && qty > selectedMax) {
      newErrors.quantity = `Cannot return more than available (${formatQuantity(selectedMax)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      transaction_id: transactionId,
      quantity_returned: parseFloat(quantity),
      remarks: remarks.trim() || null,
    });

    // Reset form
    setTransactionId("");
    setQuantity("");
    setRemarks("");
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Select Transaction */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Original Issue Transaction
        </label>
        <Select
          value={transactionId}
          onValueChange={setTransactionId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a transaction to return against" />
          </SelectTrigger>
          <SelectContent>
            {availableTransactions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No items available to return
              </div>
            ) : (
              availableTransactions.map((txn) => {
                const max = getRemainingQuantity(txn.id, Number(txn.quantity_issued));
                return (
                  <SelectItem key={txn.id} value={txn.id}>
                    {txn.material?.material_type} — {txn.material?.material_size} |{" "}
                    {formatQuantity(max)} {txn.material?.unit} left to return → {txn.employee?.full_name}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {errors.transaction && (
          <p className="mt-1 text-sm text-destructive">
            {errors.transaction}
          </p>
        )}

        {selectedTxn && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Material</span>
              <span className="font-medium">
                {selectedTxn.material?.material_type} —{" "}
                {selectedTxn.material?.material_size}
              </span>
              <span className="text-muted-foreground">
                Quantity Issued
              </span>
              <span className="font-mono font-medium">
                {formatQuantity(selectedTxn.quantity_issued)}{" "}
                {selectedTxn.material?.unit}
              </span>
              <span className="text-muted-foreground">Issued To</span>
              <span className="font-medium">
                {selectedTxn.employee?.full_name}
              </span>
              <span className="text-muted-foreground">Available to Return</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {formatQuantity(selectedMax)} {selectedTxn.material?.unit}
              </span>
              <span className="text-muted-foreground">
                {selectedTxn.machine ? "Machine" : "Purpose"}
              </span>
              <span className="font-medium">
                {selectedTxn.machine
                  ? selectedTxn.machine.machine_name
                  : selectedTxn.custom_purpose}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Quantity to Return
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
            placeholder={`Max available: ${selectedTxn ? formatQuantity(selectedMax) : "—"}`}
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
          placeholder="Reason for return..."
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Process Return
      </Button>
    </form>
  );
}
