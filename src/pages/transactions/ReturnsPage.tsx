import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import ReturnMaterialForm from "@/components/transactions/ReturnMaterialForm";

import { useTransactions } from "@/hooks/useTransactions";
import { useMaterials } from "@/hooks/useMaterials";





export default function ReturnsPage() {
  const {
    transactions,
    returns,
    loading,
    mutating,
    createMaterialReturn,
  } = useTransactions();
  const { refresh: refreshMaterials } = useMaterials();



  async function handleReturn(data: {
    transaction_id: string;
    quantity_returned: number;
    remarks?: string | null;
  }) {
    try {
      await createMaterialReturn(data);
      await refreshMaterials();

      toast.success("Material returned successfully", {
        description: "Stock has been updated.",
      });
    } catch (err: any) {
      toast.error("Failed to process return", {
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
            Material Returns
          </h1>
          <p className="text-muted-foreground">
            Process returns of previously issued materials.
          </p>
        </div>

        <div className="max-w-xl">
          {/* Return Form */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Return
            </h2>
            <ReturnMaterialForm
              transactions={transactions}
              returns={returns}
              onSubmit={handleReturn}
              loading={mutating}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

