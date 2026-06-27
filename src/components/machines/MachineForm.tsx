import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Machine } from "@/types/machine";

/* ──────────────── Schemas ──────────────── */

const machineCreateSchema = z.object({
  machine_code: z
    .string()
    .max(50, "Code must be under 50 characters")
    .optional()
    .or(z.literal("")),

  machine_name: z
    .string()
    .min(1, "Machine name is required")
    .max(200, "Name must be under 200 characters"),
});

type MachineCreateFormData = z.infer<typeof machineCreateSchema>;

const machineEditSchema = machineCreateSchema;
type MachineEditFormData = z.infer<typeof machineEditSchema>;

/* ──────────────── Create Mode ──────────────── */

function CreateMachineForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MachineCreateFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineCreateFormData>({
    resolver: zodResolver(machineCreateSchema),
    defaultValues: {
      machine_code: "",
      machine_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ machine_code: "", machine_name: "" });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
          <DialogDescription>
            Register a new machine in the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Machine Code */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Machine Code
            </label>
            <Input
              {...register("machine_code")}
              placeholder="e.g. MCH001 (optional)"
              className="font-mono"
            />
            {errors.machine_code && (
              <p className="mt-1 text-sm text-destructive">
                {errors.machine_code.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Optional unique identifier for the machine.
            </p>
          </div>

          {/* Machine Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Machine Name
            </label>
            <Input
              {...register("machine_name")}
              placeholder="e.g. CNC Lathe #2, Press Brake A"
            />
            {errors.machine_name && (
              <p className="mt-1 text-sm text-destructive">
                {errors.machine_name.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Machine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Edit Mode ──────────────── */

function EditMachineForm({
  open,
  onOpenChange,
  machine,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine: Machine;
  onSubmit: (data: MachineEditFormData) => Promise<void>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineEditFormData>({
    resolver: zodResolver(machineEditSchema),
    defaultValues: {
      machine_code: machine.machine_code ?? "",
      machine_name: machine.machine_name,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        machine_code: machine.machine_code ?? "",
        machine_name: machine.machine_name,
      });
    }
  }, [open, machine, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Machine</DialogTitle>
          <DialogDescription>
            Update machine details
            {machine.machine_code && (
              <>
                {" "}
                for{" "}
                <span className="font-medium font-mono">
                  {machine.machine_code}
                </span>
              </>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Machine Code */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Machine Code
            </label>
            <Input
              {...register("machine_code")}
              placeholder="e.g. MCH001 (optional)"
              className="font-mono"
            />
            {errors.machine_code && (
              <p className="mt-1 text-sm text-destructive">
                {errors.machine_code.message}
              </p>
            )}
          </div>

          {/* Machine Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Machine Name
            </label>
            <Input
              {...register("machine_name")}
              placeholder="e.g. CNC Lathe #2"
            />
            {errors.machine_name && (
              <p className="mt-1 text-sm text-destructive">
                {errors.machine_name.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────── Exported Wrapper ──────────────── */

interface CreateProps {
  mode: "create";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MachineCreateFormData) => Promise<void>;
  loading?: boolean;
}

interface EditProps {
  mode: "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine: Machine;
  onSubmit: (data: MachineEditFormData) => Promise<void>;
  loading?: boolean;
}

type MachineFormProps = CreateProps | EditProps;

export default function MachineForm(props: MachineFormProps) {
  if (props.mode === "create") {
    return (
      <CreateMachineForm
        open={props.open}
        onOpenChange={props.onOpenChange}
        onSubmit={props.onSubmit}
        loading={props.loading}
      />
    );
  }

  return (
    <EditMachineForm
      open={props.open}
      onOpenChange={props.onOpenChange}
      machine={props.machine}
      onSubmit={props.onSubmit}
      loading={props.loading}
    />
  );
}
