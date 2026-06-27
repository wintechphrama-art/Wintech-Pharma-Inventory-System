import { useState, useMemo } from "react";

import { toast } from "sonner";
import {
  Package,
  Plus,
  AlertTriangle,
  Layers,
  MapPin,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";

import MaterialTable from "@/components/materials/MaterialTable";
import MaterialForm from "@/components/materials/MaterialForm";
import MaterialSearch from "@/components/materials/MaterialSearch";
import DeactivateMaterialDialog from "@/components/materials/DeactivateMaterialDialog";
import DeleteMaterialDialog from "@/components/materials/DeleteMaterialDialog";

import { useMaterials } from "@/hooks/useMaterials";
import { usePermissions } from "@/hooks/usePermissions";

import type { Material } from "@/types/material";
import type {
  MaterialCreateFormData,
  MaterialEditFormData,
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
  } = useMaterials();

  const { can } = usePermissions();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
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
          (m.location && m.location.toLowerCase().includes(query))
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
    const locations = new Set(
      materials
        .filter((m) => m.status && m.location)
        .map((m) => m.location)
    ).size;
    return { total, lowStock, types, locations };
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
        location: data.location || null,
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
        location: data.location || null,
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
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
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
            label="Storage Locations"
            value={stats.locations}
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