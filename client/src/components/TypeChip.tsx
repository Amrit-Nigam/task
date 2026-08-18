import { cn } from "@/lib/utils";
import { formatName } from "@/lib/format";
import { typeRgb } from "@/lib/types-theme";

interface TypeChipProps {
  type: string;
  size?: "sm" | "md";
  className?: string;
}

/** A Pokémon type rendered in its own hue. */
export function TypeChip({ type, size = "sm", className }: TypeChipProps) {
  return (
    <span
      style={{ "--type-rgb": typeRgb(type) } as React.CSSProperties}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        "border-[rgb(var(--type-rgb)/0.32)] bg-[rgb(var(--type-rgb)/0.14)] text-[rgb(var(--type-rgb))]",
        "dark:bg-[rgb(var(--type-rgb)/0.18)] dark:brightness-125",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-sm",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--type-rgb))]" aria-hidden />
      {formatName(type)}
    </span>
  );
}
