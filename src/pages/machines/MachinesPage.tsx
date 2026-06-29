import { useState, useMemo } from "react";

import { toast } from "sonner";
import {
  Cog,
  Plus,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import MachineTable from "@/components/machines/MachineTable";
import MachineForm from "@/components/machines/MachineForm";
import DeleteMachineDialog from "@/components/machines/DeleteMachineDialog";

import { useMachines } from "@/hooks/useMachines";
import { usePermissions } from "@/hooks/usePermissions";

import type { Machine } from "@/types/machine";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function MachinesPage() {
  const {
    machines,
    loading,
    mutating,
    createMachine,
    updateMachine,
    deactivateMachine,
    reactivateMachine,
    deleteMachine,
  } = useMachines();

  const { can } = usePermissions();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] =
    useState<Machine | null>(null);

  // Search
  const [search, setSearch] = useState("");

  const filteredMachines = useMemo(() => {
    if (!search.trim()) return machines;
    const query = search.toLowerCase();
    return machines.filter(
      (m) =>
        m.machine_name.toLowerCase().includes(query) ||
        (m.machine_code &&
          m.machine_code.toLowerCase().includes(query))
    );
  }, [machines, search]);

  // Stats
  const stats = useMemo(() => {
    const total = machines.length;
    const active = machines.filter((m) => m.status).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [machines]);

  // Handlers
  async function handleCreate(data: {
    machine_code?: string;
    machine_name: string;
  }) {
    try {
      await createMachine({
        machine_code: data.machine_code || null,
        machine_name: data.machine_name,
      });
      setCreateOpen(false);
      toast.success("Machine added successfully", {
        description: `${data.machine_name} has been registered.`,
      });
    } catch (err: any) {
      toast.error("Failed to add machine", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  async function handleEdit(data: {
    machine_code?: string;
    machine_name: string;
  }) {
    if (!selectedMachine) return;
    try {
      await updateMachine(selectedMachine.id, {
        machine_code: data.machine_code || null,
        machine_name: data.machine_name,
      });
      setEditOpen(false);
      setSelectedMachine(null);
      toast.success("Machine updated successfully", {
        description: `${data.machine_name} has been updated.`,
      });
    } catch (err: any) {
      toast.error("Failed to update machine", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  function handleEditClick(machine: Machine) {
    setSelectedMachine(machine);
    setEditOpen(true);
  }

  function handleToggleActiveClick(machine: Machine) {
    setSelectedMachine(machine);
    setDeactivateOpen(true);
  }

  function handleDeleteClick(machine: Machine) {
    setSelectedMachine(machine);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedMachine) return;
    try {
      await deleteMachine(selectedMachine.id);
      toast.success("Machine deleted", {
        description: `${selectedMachine.machine_name} has been deleted.`,
      });
      setDeleteOpen(false);
      setSelectedMachine(null);
    } catch (err: any) {
      toast.error("Delete failed", {
        description: err.message || "Something went wrong.",
      });
    }
  }

  async function handleConfirmToggle() {
    if (!selectedMachine) return;
    try {
      if (selectedMachine.status) {
        await deactivateMachine(selectedMachine.id);
        toast.success("Machine deactivated", {
          description: `${selectedMachine.machine_name} has been deactivated.`,
        });
      } else {
        await reactivateMachine(selectedMachine.id);
        toast.success("Machine reactivated", {
          description: `${selectedMachine.machine_name} has been reactivated.`,
        });
      }
      setDeactivateOpen(false);
      setSelectedMachine(null);
    } catch (err: any) {
      toast.error("Operation failed", {
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
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border bg-muted/30"
              />
            ))}
          </div>
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
              Machines
            </h1>
            <p className="text-muted-foreground">
              Manage factory machines and equipment.
            </p>
          </div>

          {can("view_machines") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Machine
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Cog className="h-5 w-5" />}
            label="Total Machines"
            value={stats.total}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Active"
            value={stats.active}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="Inactive"
            value={stats.inactive}
            accent="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
          />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <MachineTable
          machines={filteredMachines}
          canEdit={can("view_machines")}
          canDelete={can("view_machines")}
          onEdit={handleEditClick}
          onToggleActive={handleToggleActiveClick}
          onDelete={handleDeleteClick}
        />

        {/* Create Dialog */}
        <MachineForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
          loading={mutating}
        />

        {/* Edit Dialog */}
        {selectedMachine && editOpen && (
          <MachineForm
            mode="edit"
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setSelectedMachine(null);
            }}
            machine={selectedMachine}
            onSubmit={handleEdit}
            loading={mutating}
          />
        )}

        {/* Deactivate/Reactivate Confirmation */}
        {selectedMachine && (
          <Dialog open={deactivateOpen} onOpenChange={(open) => {
            setDeactivateOpen(open);
            if (!open) setSelectedMachine(null);
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      selectedMachine.status
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        selectedMachine.status
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  </div>
                  <div>
                    <DialogTitle>
                      {selectedMachine.status
                        ? "Deactivate Machine"
                        : "Reactivate Machine"}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedMachine.status
                        ? `Are you sure you want to deactivate ${selectedMachine.machine_name}?`
                        : `Are you sure you want to reactivate ${selectedMachine.machine_name}?`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">
                    {selectedMachine.machine_name}
                  </span>
                  {selectedMachine.machine_code && (
                    <>
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-mono font-medium">
                        {selectedMachine.machine_code}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeactivateOpen(false)}
                  disabled={mutating}
                >
                  Cancel
                </Button>
                <Button
                  variant={
                    selectedMachine.status ? "destructive" : "default"
                  }
                  onClick={handleConfirmToggle}
                  disabled={mutating}
                >
                  {mutating
                    ? "Processing..."
                    : selectedMachine.status
                      ? "Deactivate"
                      : "Reactivate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <DeleteMachineDialog
          machine={selectedMachine}
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setSelectedMachine(null);
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
