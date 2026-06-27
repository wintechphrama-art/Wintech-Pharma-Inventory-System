import { useState, useMemo } from "react";

import { Search } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TransactionTable, { type UnifiedTransaction } from "@/components/transactions/TransactionTable";

import { useTransactions } from "@/hooks/useTransactions";

export default function TransactionHistoryPage() {
  const { transactions, returns, loading } = useTransactions();

  // Filters
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get unique material names for filter
  const materialNames = useMemo(() => {
    const names = [
      ...new Set(
        transactions.map(
          (t) =>
            `${t.material?.material_type} — ${t.material?.material_size}`
        )
      ),
    ];
    return names.sort();
  }, [transactions]);

  // Merge issues and returns into a single timeline
  const unifiedHistory = useMemo<UnifiedTransaction[]>(() => {
    const issues: UnifiedTransaction[] = transactions.map((t) => ({
      id: t.id,
      type: "issue",
      material: t.material,
      employee: t.employee,
      quantity: t.quantity_issued,
      date: t.issued_at,
      machine: t.machine,
      custom_purpose: t.custom_purpose,
      remarks: t.remarks,
      creator: t.creator,
    }));

    const rets: UnifiedTransaction[] = returns.map((r) => ({
      id: r.id,
      type: "return",
      material: r.transaction?.material,
      employee: r.transaction?.employee,
      quantity: r.quantity_returned,
      date: r.returned_at,
      machine: r.transaction?.machine,
      custom_purpose: r.transaction?.custom_purpose,
      remarks: r.remarks,
      creator: r.creator,
    }));

    return [...issues, ...rets].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, returns]);

  const filteredTransactions = useMemo(() => {
    let result = unifiedHistory;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.employee?.full_name?.toLowerCase().includes(query) ||
          t.employee?.employee_code?.toLowerCase().includes(query) ||
          t.material?.material_type?.toLowerCase().includes(query) ||
          t.material?.material_size?.toLowerCase().includes(query) ||
          t.machine?.machine_name?.toLowerCase().includes(query) ||
          t.custom_purpose?.toLowerCase().includes(query) ||
          t.remarks?.toLowerCase().includes(query) ||
          t.type.includes(query)
      );
    }

    if (materialFilter !== "all") {
      result = result.filter(
        (t) =>
          `${t.material?.material_type} — ${t.material?.material_size}` ===
          materialFilter
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((t) => new Date(t.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= end);
    }

    return result;
  }, [unifiedHistory, search, materialFilter, startDate, endDate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View all material issue transactions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by employee, material, machine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={materialFilter}
            onValueChange={setMaterialFilter}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {materialNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of{" "}
          {unifiedHistory.length} history records
        </p>

        {/* Table */}
        <TransactionTable transactions={filteredTransactions} />
      </div>
    </AppLayout>
  );
}
