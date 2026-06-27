interface Props {
  current: number;
  minimum: number;
}

export default function StockLevelBadge({ current, minimum }: Props) {
  const isLow = current <= minimum;
  const isOut = current === 0;

  if (isOut) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        Out of Stock
      </span>
    );
  }

  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      In Stock
    </span>
  );
}
