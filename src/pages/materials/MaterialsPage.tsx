import { useState, useMemo } from "react";

import { toast } from "sonner";
import {
  Package,
  Plus,
  PackagePlus,
  AlertTriangle,
  Layers,
  MapPin,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";

import MaterialTable from "@/components/materials/MaterialTable";
import MaterialForm from "@/components/materials/MaterialForm";
import MaterialSearch from "@/components/materials/MaterialSearch";
import RestockMaterialDialog from "@/components/materials/RestockMaterialDialog";
import DeactivateMaterialDialog from "@/components/materials/DeactivateMaterialDialog";
import DeleteMaterialDialog from "@/components/materials/DeleteMaterialDialog";

import { useMaterials } from "@/hooks/useMaterials";
import { usePermissions } from "@/hooks/usePermissions";

import type { Material } from "@/types/material";
import type {
  MaterialCreateFormData,
  MaterialEditFormData,
  RestockFormData,
} from "@/lib/validators";

export default function MaterialsPage() {
  const {
    materials,
    loading,
    mutating,
    createMaterial,
    updateMaterial,
    deactivateMaterial,
    reactivateMaterial,
    deleteMaterial,
    restockMaterial,
  } = useMaterials();

  const { can } = usePermissions();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<Material | null>(null);
  const [restockMaterial_, setRestockMaterial_] =
    useState<Material | null>(null);

  // Search / filter
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Distinct material types for filter dropdown
  const materialTypes = useMemo(() => {
    const types = [...new Set(materials.map((m) => m.material_type))];
    return types.sort();
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    let result = materials;

    // Text search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.material_type.toLowerCase().includes(query) ||
          m.material_size.toLowerCase().includes(query) ||
          (m.vendor && m.vendor.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((m) => m.material_type === typeFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((m) => m.status);
    } else if (statusFilter === "inactive") {
      result = result.filter((m) => !m.status);
    } else if (statusFilter === "low_stock") {
      result = result.filter(
        (m) =>
          m.status &&
          Number(m.current_quantity) <= Number(m.minimum_stock)
      );
    }

    return result;
  }, [materials, search, typeFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = materials.filter((m) => m.status).length;
    const lowStock = materials.filter(
      (m) =>
        m.status &&
        Number(m.current_quantity) <= Number(m.minimum_stock)
    ).length;
    const types = new Set(
      materials.filter((m) => m.status).map((m) => m.material_type)
    ).size;
    const vendors = new Set(
      materials
        .filter((m) => m.status && m.vendor)
        .map((m) => m.vendor)
    ).size;
    return { total, lowStock, types, vendors };
  }, [materials]);

  // Handlers
  async function handleCreate(data: MaterialCreateFormData) {
    try {
      await createMaterial({
        material_type: data.material_type,
        material_size: data.material_size,
        unit: data.unit,
        minimum_stock: data.minimum_stock,
        current_quantity: data.current_quantity,
        vendor: data.vendor || null,
      });
      setCreateOpen(false);
      toast.success("Material added successfully", {
        description: `${data.material_type} — ${data.material_size} has been added.`,
      });
    } catch (err: any) {
      toast.error("Failed to add material", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  async function handleEdit(data: MaterialEditFormData) {
    if (!selectedMaterial) return;
    try {
      await updateMaterial(selectedMaterial.id, {
        material_type: data.material_type,
        material_size: data.material_size,
        unit: data.unit,
        minimum_stock: data.minimum_stock,
        vendor: data.vendor || null,
      });
      setEditOpen(false);
      setSelectedMaterial(null);
      toast.success("Material updated successfully", {
        description: `${data.material_type} — ${data.material_size} has been updated.`,
      });
    } catch (err: any) {
      toast.error("Failed to update material", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  function handleEditClick(material: Material) {
    setSelectedMaterial(material);
    setEditOpen(true);
  }

  function handleRestockClick(material?: Material) {
    setRestockMaterial_(material ?? null);
    setRestockOpen(true);
  }

  async function handleRestock(data: RestockFormData) {
    try {
      await restockMaterial(data.material_id, data.quantity, data.remarks);
      setRestockOpen(false);
      setRestockMaterial_(null);
      const mat = materials.find((m) => m.id === data.material_id);
      toast.success("Material restocked successfully", {
        description: mat
          ? `${mat.material_type} — ${mat.material_size}: +${data.quantity} ${mat.unit}`
          : `Added ${data.quantity} units.`,
      });
    } catch (err: any) {
      toast.error("Failed to restock material", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  function handleToggleActiveClick(material: Material) {
    setSelectedMaterial(material);
    setDeactivateOpen(true);
  }

  function handleDeleteClick(material: Material) {
    setSelectedMaterial(material);
    setDeleteOpen(true);
  }

  async function handleConfirmToggle() {
    if (!selectedMaterial) return;
    try {
      if (selectedMaterial.status) {
        await deactivateMaterial(selectedMaterial.id);
        toast.success("Material deactivated", {
          description: `${selectedMaterial.material_type} — ${selectedMaterial.material_size} has been deactivated.`,
        });
      } else {
        await reactivateMaterial(selectedMaterial.id);
        toast.success("Material reactivated", {
          description: `${selectedMaterial.material_type} — ${selectedMaterial.material_size} has been reactivated.`,
        });
      }
      setDeactivateOpen(false);
      setSelectedMaterial(null);
    } catch (err: any) {
      toast.error("Operation failed", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  async function handleConfirmDelete() {
    if (!selectedMaterial) return;
    try {
      await deleteMaterial(selectedMaterial.id);
      toast.success("Material deleted", {
        description: `${selectedMaterial.material_type} — ${selectedMaterial.material_size} has been deleted.`,
      });
      setDeleteOpen(false);
      setSelectedMaterial(null);
    } catch (err: any) {
      toast.error("Delete failed", {
        description: "Cannot delete this material. It may be linked to existing transactions.",
      });
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Skeleton header */}
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Skeleton stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border bg-muted/30"
              />
            ))}
          </div>

          {/* Skeleton table */}
          <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Materials
            </h1>
            <p className="text-muted-foreground">
              Manage inventory materials, stock levels, and storage.
            </p>
          </div>

          {can("manage_materials") && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleRestockClick()}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                <PackagePlus className="mr-2 h-4 w-4" />
                Restock
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package className="h-5 w-5" />}
            label="Total Materials"
            value={stats.total}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Low Stock"
            value={stats.lowStock}
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={<Layers className="h-5 w-5" />}
            label="Material Types"
            value={stats.types}
            accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label="Vendors"
            value={stats.vendors}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Search & Filters */}
        <MaterialSearch
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          materialTypes={materialTypes}
        />

        {/* Table */}
        <MaterialTable
          materials={filteredMaterials}
          canEdit={can("manage_materials")}
          canDelete={can("manage_materials")}
          onEdit={handleEditClick}
          onRestock={handleRestockClick}
          onToggleActive={handleToggleActiveClick}
          onDelete={handleDeleteClick}
        />

        {/* Create Dialog */}
        <MaterialForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
          loading={mutating}
        />

        {/* Edit Dialog */}
        {selectedMaterial && editOpen && (
          <MaterialForm
            mode="edit"
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setSelectedMaterial(null);
            }}
            material={selectedMaterial}
            onSubmit={handleEdit}
            loading={mutating}
          />
        )}

        {/* Deactivate/Reactivate Confirmation */}
        <DeactivateMaterialDialog
          material={selectedMaterial}
          open={deactivateOpen}
          onOpenChange={(open) => {
            setDeactivateOpen(open);
            if (!open) setSelectedMaterial(null);
          }}
          onConfirm={handleConfirmToggle}
          loading={mutating}
        />

        {/* Delete Confirmation */}
        <DeleteMaterialDialog
          material={selectedMaterial}
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setSelectedMaterial(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={mutating}
        />

        {/* Restock Dialog */}
        <RestockMaterialDialog
          open={restockOpen}
          onOpenChange={(open) => {
            setRestockOpen(open);
            if (!open) setRestockMaterial_(null);
          }}
          materials={materials}
          preselectedMaterial={restockMaterial_}
          onSubmit={handleRestock}
          loading={mutating}
        />
      </div>
    </AppLayout>
  );
}

/* ─── Stat Card Sub-component ─── */

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}