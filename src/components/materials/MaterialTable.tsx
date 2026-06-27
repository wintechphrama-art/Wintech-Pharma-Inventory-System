import { Package } from "lucide-react";

import type { Material } from "@/types/material";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MaterialStatusBadge from "./MaterialStatusBadge";
import StockLevelBadge from "./StockLevelBadge";
import MaterialActions from "./MaterialActions";

interface Props {
  materials: Material[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (material: Material) => void;
  onToggleActive: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export default function MaterialTable({
  materials,
  canEdit,
  canDelete,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No materials found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding your first material.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Type</TableHead>
            <TableHead>Size / Spec</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="w-[60px] text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {materials.map((material) => {
            const isLow =
              material.current_quantity <= material.minimum_stock;

            return (
              <TableRow
                key={material.id}
                className={`transition-colors ${
                  isLow && material.status
                    ? "bg-amber-500/5 hover:bg-amber-500/10"
                    : ""
                }`}
              >
                <TableCell className="font-medium">
                  {material.material_type}
                </TableCell>

                <TableCell>{material.material_size}</TableCell>

                <TableCell className="text-right font-mono tabular-nums">
                  {Number(material.current_quantity).toLocaleString()}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {material.unit}
                </TableCell>

                <TableCell>
                  <StockLevelBadge
                    current={Number(material.current_quantity)}
                    minimum={Number(material.minimum_stock)}
                  />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {material.location || "—"}
                </TableCell>

                <TableCell>
                  <MaterialStatusBadge isActive={material.status} />
                </TableCell>

                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <MaterialActions
                      material={material}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onEdit={onEdit}
                      onToggleActive={onToggleActive}
                      onDelete={onDelete}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
