import { ArrowRightLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDate } from "@/utils/formatDate";
import { formatQuantity } from "@/lib/utils";

export type UnifiedTransaction = {
  id: string;
  type: "issue" | "return";
  material?: {
    material_type: string;
    material_size: string;
    unit: string;
  };
  employee?: {
    full_name: string;
    employee_code: string;
  };
  machine?: {
    machine_code: string | null;
    machine_name: string;
  } | null;
  creator?: {
    full_name: string;
    employee_code: string;
  } | null;
  quantity: number;
  date: string;
  custom_purpose?: string | null;
  remarks: string | null;
};

interface Props {
  transactions: UnifiedTransaction[];
  showMaterial?: boolean;
  showEmployee?: boolean;
}

export default function TransactionTable({
  transactions,
  showMaterial = true,
  showEmployee = true,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ArrowRightLeft className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No transactions found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Issue materials to see transactions here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Type</TableHead>
            {showMaterial && <TableHead>Material</TableHead>}
            {showEmployee && <TableHead>Employee</TableHead>}
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Machine / Purpose</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Action By</TableHead>
            <TableHead className="w-[140px]">Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id} className="transition-colors">
              <TableCell>
                <Badge
                  variant={txn.type === "issue" ? "default" : "secondary"}
                  className={
                    txn.type === "issue"
                      ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                      : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                  }
                >
                  {txn.type === "issue" ? "ISSUE" : "RETURN"}
                </Badge>
              </TableCell>
              {showMaterial && (
                <TableCell className="font-medium">
                  <div>
                    {txn.material?.material_type ?? "—"}
                    <span className="ml-1 text-muted-foreground">
                      {txn.material?.material_size}
                    </span>
                  </div>
                </TableCell>
              )}

              {showEmployee && (
                <TableCell>
                  <div>
                    <span className="font-medium">
                      {txn.employee?.full_name ?? "—"}
                    </span>
                    {txn.employee?.employee_code && (
                      <span className="ml-1 text-xs text-muted-foreground font-mono">
                        ({txn.employee.employee_code})
                      </span>
                    )}
                  </div>
                </TableCell>
              )}

              <TableCell className="text-right font-mono font-medium">
                {txn.type === "issue" ? "-" : "+"}
                {formatQuantity(txn.quantity)}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {txn.material?.unit ?? "—"}
              </TableCell>

              <TableCell>
                {txn.machine ? (
                  <span>
                    {txn.machine.machine_name}
                    {txn.machine.machine_code && (
                      <span className="ml-1 text-xs text-muted-foreground font-mono">
                        ({txn.machine.machine_code})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">
                    {txn.custom_purpose || "—"}
                  </span>
                )}
              </TableCell>

              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {txn.remarks || "—"}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {txn.creator?.full_name ?? "—"}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(txn.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
