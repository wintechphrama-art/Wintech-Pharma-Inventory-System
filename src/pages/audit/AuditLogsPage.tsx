import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, ClipboardList, ShieldAlert } from "lucide-react";

import { getAuditLogs } from "@/services/supabase/audit";
import type { AuditLog } from "@/types/audit";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  function getActionColor(action: string) {
    switch (action.toUpperCase()) {
      case "CREATE":
      case "REACTIVATE":
      case "LOGIN":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "UPDATE":
      case "ISSUE":
      case "RETURN":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "DELETE":
      case "DEACTIVATE":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Error Loading Logs</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          View all actions performed by users in the system.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-3">
            <ClipboardList className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(log.created_at), "PP pp")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user?.full_name || "Unknown"}</div>
                      {log.user?.employee_code && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {log.user.employee_code}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.entity_id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.details ? (
                        <pre className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {JSON.stringify(log.details)}
                        </pre>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
