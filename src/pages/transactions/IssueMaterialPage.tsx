import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import IssueMaterialForm from "@/components/transactions/IssueMaterialForm";

import { useTransactions } from "@/hooks/useTransactions";
import { useMaterials } from "@/hooks/useMaterials";
import { useEmployees } from "@/hooks/useEmployees";
import { useMachines } from "@/hooks/useMachines";

export default function IssueMaterialPage() {
  const { loading, mutating, createTransaction } =
    useTransactions();
  const { materials, refresh: refreshMaterials } = useMaterials();
  const { employees } = useEmployees();
  const { machines } = useMachines();


  async function handleIssue(data: {
    material_id: string;
    employee_id: string;
    quantity_issued: number;
    machine_id?: string | null;
    custom_purpose?: string | null;
    remarks?: string | null;
  }) {
    try {
      const result = await createTransaction(data);
      // Refresh materials to reflect updated stock
      await refreshMaterials();

      toast.success("Material issued successfully", {
        description: `${result.material?.material_type} — ${result.material?.material_size} issued to ${result.employee?.full_name}.`,
      });
    } catch (err: any) {
      toast.error("Failed to issue material", {
        description: err.message || "Something went wrong.",
      });
    }
  }

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Issue Material
          </h1>
          <p className="text-muted-foreground">
            Issue materials from inventory to employees.
          </p>
        </div>

        <div className="max-w-xl">
          {/* Issue Form */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              New Issue
            </h2>
            <IssueMaterialForm
              materials={materials}
              employees={employees}
              machines={machines}
              onSubmit={handleIssue}
              loading={mutating}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
