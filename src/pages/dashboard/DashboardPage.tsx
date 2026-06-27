import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Users,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useEmployees } from "@/hooks/useEmployees";
import { useMaterials } from "@/hooks/useMaterials";
import { useTransactions } from "@/hooks/useTransactions";
import { usePermissions } from "@/hooks/usePermissions";
import { formatQuantity } from "@/lib/utils";

export default function DashboardPage() {
  const { employees } = useEmployees();
  const { materials } = useMaterials();
  const { transactions } = useTransactions();
  const { can } = usePermissions();

  const activeEmployees = employees.filter(
    (e) => e.is_active
  ).length;

  const activeMaterials = materials.filter(
    (m) => m.status
  ).length;

  const lowStockCount = materials.filter(
    (m) =>
      m.status &&
      Number(m.current_quantity) <= Number(m.minimum_stock)
  ).length;

  // Transactions today
  const today = new Date().toISOString().split("T")[0];
  const transactionsToday = transactions.filter((t) =>
    t.issued_at.startsWith(today)
  ).length;

  const cards = [
    {
      label: "Total Materials",
      value: activeMaterials,
      icon: Package,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/5 to-transparent",
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/5 to-transparent",
    },
  ];

  if (can("view_transactions")) {
    cards.push({
      label: "Transactions Today",
      value: transactionsToday,
      icon: ArrowRightLeft,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500/5 to-transparent",
    });
  }

  if (can("view_employees")) {
    cards.push({
      label: "Active Employees",
      value: activeEmployees,
      icon: Users,
      accent: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/5 to-transparent",
    });
  }

  // Low stock materials for alert list
  const lowStockMaterials = materials
    .filter(
      (m) =>
        m.status &&
        Number(m.current_quantity) <= Number(m.minimum_stock)
    )
    .sort(
      (a, b) =>
        Number(a.current_quantity) - Number(b.current_quantity)
    )
    .slice(0, 10);

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of factory operations.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
              >
                {/* Gradient background accent */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
                />

                <div className="relative flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </h2>
            </div>
            {lowStockMaterials.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                All materials are adequately stocked. 🎉
              </div>
            ) : (
              <div className="divide-y">
                {lowStockMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {m.material_type}{" "}
                        <span className="text-muted-foreground">
                          — {m.material_size}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {formatQuantity(m.minimum_stock)}{" "}
                        {m.unit}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        Number(m.current_quantity) === 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {formatQuantity(m.current_quantity)}{" "}
                      {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity (Only for those with permission) */}
          {can("view_transactions") && (
            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
                  Recent Activity
                </h2>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No transactions yet.
                </div>
              ) : (
                <div className="divide-y">
                  {recentTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          {txn.material?.material_type}{" "}
                          <span className="text-muted-foreground">
                            — {txn.material?.material_size}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          → {txn.employee?.full_name}
                          {txn.machine && ` • ${txn.machine.machine_name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold">
                          {formatQuantity(txn.quantity_issued)}{" "}
                          {txn.material?.unit}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}