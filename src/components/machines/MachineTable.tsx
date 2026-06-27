import { Cog } from "lucide-react";

import type { Machine } from "@/types/machine";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MachineStatusBadge from "./MachineStatusBadge";
import MachineActions from "./MachineActions";

import { formatDate } from "@/utils/formatDate";

interface Props {
  machines: Machine[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (machine: Machine) => void;
  onToggleActive: (machine: Machine) => void;
}

export default function MachineTable({
  machines,
  canEdit,
  canDelete,
  onEdit,
  onToggleActive,
}: Props) {
  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Cog className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No machines found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding your first machine.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[140px]">Machine Code</TableHead>
            <TableHead>Machine Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Added</TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="w-[60px] text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {machines.map((machine) => (
            <TableRow
              key={machine.id}
              className="transition-colors"
            >
              <TableCell className="font-mono text-sm font-medium">
                {machine.machine_code || "—"}
              </TableCell>

              <TableCell className="font-medium">
                {machine.machine_name}
              </TableCell>

              <TableCell>
                <MachineStatusBadge isActive={machine.status} />
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(machine.created_at)}
              </TableCell>

              {(canEdit || canDelete) && (
                <TableCell className="text-right">
                  <MachineActions
                    machine={machine}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
