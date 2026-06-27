import { useState, useMemo } from "react";
import { Download } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useMaterials } from "@/hooks/useMaterials";
import { useTransactions } from "@/hooks/useTransactions";

import { exportToCsv } from "@/utils/exportCsv";
import { formatDate } from "@/utils/formatDate";

export default function ReportsPage() {
  const { materials } = useMaterials();
  const { transactions, returns } = useTransactions();

  // Active Tab
  const [activeTab, setActiveTab] = useState("stock");

  // Date Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ─── 1. Current Stock Report ─── */
  const stockReport = useMemo(() => {
    return materials
      .filter((m) => m.status) // Only active
      .map((m) => ({
        "Material Type": m.material_type,
        "Size": m.material_size,
        "Current Quantity": Number(m.current_quantity),
        "Minimum Stock": Number(m.minimum_stock),
        "Unit": m.unit,
        "Location": m.location || "—",
        "Status": Number(m.current_quantity) <= Number(m.minimum_stock) ? "Low Stock" : "In Stock",
      }));
  }, [materials]);

  /* ─── Filter Transactions by Date ─── */
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((t) => new Date(t.issued_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.issued_at) <= end);
    }
    return result;
  }, [transactions, startDate, endDate]);

  /* ─── 2. Employee Usage Report ─── */
  const employeeReport = useMemo(() => {
    const stats: Record<string, { totalQuantity: number; transactionCount: number }> = {};
    
    // Aggregate data
    filteredTransactions.forEach((t) => {
      const empName = t.employee?.full_name || "Unknown";
      const empCode = t.employee?.employee_code ? ` (${t.employee.employee_code})` : "";
      const key = `${empName}${empCode}`;

      if (!stats[key]) {
        stats[key] = { totalQuantity: 0, transactionCount: 0 };
      }
      stats[key].totalQuantity += Number(t.quantity_issued);
      stats[key].transactionCount += 1;
    });

    // Convert to array
    return Object.entries(stats)
      .map(([employee, data]) => ({
        "Employee": employee,
        "Total Quantity Issued": data.totalQuantity,
        "Number of Transactions": data.transactionCount,
      }))
      .sort((a, b) => b["Total Quantity Issued"] - a["Total Quantity Issued"]);
  }, [filteredTransactions]);

  /* ─── 3. Machine Usage Report ─── */
  const machineReport = useMemo(() => {
    const stats: Record<string, { totalQuantity: number; transactionCount: number }> = {};
    
    // Aggregate data
    filteredTransactions.forEach((t) => {
      if (!t.machine) return; // Only count transactions tied to a machine
      const mName = t.machine.machine_name;
      const mCode = t.machine.machine_code ? ` (${t.machine.machine_code})` : "";
      const key = `${mName}${mCode}`;

      if (!stats[key]) {
        stats[key] = { totalQuantity: 0, transactionCount: 0 };
      }
      stats[key].totalQuantity += Number(t.quantity_issued);
      stats[key].transactionCount += 1;
    });

    // Convert to array
    return Object.entries(stats)
      .map(([machine, data]) => ({
        "Machine": machine,
        "Total Quantity Used": data.totalQuantity,
        "Number of Transactions": data.transactionCount,
      }))
      .sort((a, b) => b["Total Quantity Used"] - a["Total Quantity Used"]);
  }, [filteredTransactions]);

  /* ─── 4. Transaction Records (Issues & Returns) ─── */
  const transactionRecords = useMemo(() => {
    // We combine issues and returns into a single list, then filter by date, then sort by date desc
    const allRecords: any[] = [];

    transactions.forEach(t => {
      allRecords.push({
        "Type": "ISSUE",
        "Date": t.issued_at,
        "Material": `${t.material?.material_type} — ${t.material?.material_size}`,
        "Employee": t.employee?.full_name || "—",
        "Machine": t.machine?.machine_name || "—",
        "Quantity": Number(t.quantity_issued),
        "Unit": t.material?.unit || "—",
        "Remarks": t.remarks || t.custom_purpose || "—",
        "Processed By": t.creator?.full_name || "—",
      });
    });

    returns.forEach(r => {
      allRecords.push({
        "Type": "RETURN",
        "Date": r.returned_at,
        "Material": `${r.transaction?.material?.material_type} — ${r.transaction?.material?.material_size}`,
        "Employee": r.transaction?.employee?.full_name || "—",
        "Machine": r.transaction?.machine?.machine_name || "—",
        "Quantity": Number(r.quantity_returned),
        "Unit": r.transaction?.material?.unit || "—",
        "Remarks": r.remarks || "—",
        "Processed By": r.creator?.full_name || "—",
      });
    });

    // Apply date filters
    let result = allRecords;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.Date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.Date) <= end);
    }

    // Sort by date desc
    return result.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  }, [transactions, returns, startDate, endDate]);


  /* ─── Handlers ─── */
  function handleExport() {
    let dataToExport: any[] = [];
    let filename = "";

    switch (activeTab) {
      case "stock":
        dataToExport = stockReport;
        filename = "Current_Stock_Report";
        break;
      case "employee":
        dataToExport = employeeReport;
        filename = "Employee_Usage_Report";
        break;
      case "machine":
        dataToExport = machineReport;
        filename = "Machine_Usage_Report";
        break;
      case "transactions":
        // Format dates for CSV output to make it cleaner
        dataToExport = transactionRecords.map(r => ({
          ...r,
          "Date": formatDate(r.Date)
        }));
        filename = "Transaction_Records";
        break;
    }

    exportToCsv(dataToExport, filename);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header & Export Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and export inventory reports and usage analytics.
            </p>
          </div>
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        {/* Global Date Filters (Applies to usage reports) */}
        {activeTab !== "stock" && (
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
            <span className="text-sm font-medium">Filter by Date:</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="stock">Current Stock</TabsTrigger>
            <TabsTrigger value="employee">Employee Usage</TabsTrigger>
            <TabsTrigger value="machine">Machine Usage</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Records</TabsTrigger>
          </TabsList>

          {/* 1. Stock Tab */}
          <TabsContent value="stock" className="mt-6">
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Current Qty</TableHead>
                    <TableHead className="text-right">Min Stock</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockReport.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {row["Material Type"]} <span className="text-muted-foreground">{row["Size"]}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {row["Current Quantity"].toLocaleString()} <span className="text-muted-foreground font-sans text-xs">{row["Unit"]}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {row["Minimum Stock"].toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row["Location"]}
                      </TableCell>
                      <TableCell>
                        {row["Status"] === "Low Stock" ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500">
                            In Stock
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stockReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No materials found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 2. Employee Usage Tab */}
          <TabsContent value="employee" className="mt-6">
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Total Items Issued</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeReport.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row["Employee"]}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {row["Total Quantity Issued"].toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row["Number of Transactions"]}
                      </TableCell>
                    </TableRow>
                  ))}
                  {employeeReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        No employee usage found for the selected dates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 3. Machine Usage Tab */}
          <TabsContent value="machine" className="mt-6">
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine</TableHead>
                    <TableHead className="text-right">Total Items Used</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineReport.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row["Machine"]}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {row["Total Quantity Used"].toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row["Number of Transactions"]}
                      </TableCell>
                    </TableRow>
                  ))}
                  {machineReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        No machine usage found for the selected dates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 4. Transaction Records Tab */}
          <TabsContent value="transactions" className="mt-6">
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionRecords.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(row["Date"])}
                      </TableCell>
                      <TableCell>
                        {row["Type"] === "ISSUE" ? (
                           <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                             ISSUE
                           </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                             RETURN
                           </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row["Material"]}</TableCell>
                      <TableCell className="text-muted-foreground">{row["Employee"]}</TableCell>
                      <TableCell className="text-muted-foreground">{row["Machine"]}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {row["Type"] === "ISSUE" ? "-" : "+"}{row["Quantity"].toLocaleString()} <span className="text-muted-foreground font-sans text-xs">{row["Unit"]}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactionRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No transaction records found for the selected dates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}