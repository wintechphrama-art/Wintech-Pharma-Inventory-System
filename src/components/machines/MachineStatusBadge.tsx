interface Props {
  isActive: boolean;
}

export default function MachineStatusBadge({ isActive }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-zinc-400"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
