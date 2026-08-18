import { RotateCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** Says what failed and gives one way forward. */
export function ErrorState({ title = "Something went wrong.", message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="panel mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-signal/10 text-signal">
        <Unplug className="h-6 w-6" />
      </span>
      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="solid" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
