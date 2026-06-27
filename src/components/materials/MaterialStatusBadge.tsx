interface Props {
  isActive: boolean;
}

export default function MaterialStatusBadge({ isActive }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
