import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A moulded control. Every variant carries the casing outline and travels into
 * its own drop shadow on press (`.pd-press`) rather than dimming or scaling —
 * the feedback should read as a key going down, not as a hover state.
 *
 * `signal` fills with the ball's accent and takes `--pd-accent-ink` for its
 * label: black on Ultra's gold, white elsewhere. Hard-coding white there makes
 * Ultra's buttons unreadable.
 */
const buttonVariants = cva(
  "pd-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border-[3px] border-[var(--pd-black)] font-semibold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-ink text-canvas",
        outline: "bg-surface text-ink hover:bg-raised",
        ghost: "border-transparent shadow-none text-muted hover:bg-ink/[0.06] hover:text-ink",
        signal: "bg-[var(--pd-accent)] text-[var(--pd-accent-ink)] hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
