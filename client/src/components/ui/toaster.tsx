import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-1/2 z-[100] flex w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 p-4">
      {toasts.map(({ id, title, description, action, variant, className }) => (
        <div
          key={id}
          role="status"
          className={cn(
            "relative w-full rounded-md border bg-background p-6 pr-10 text-foreground shadow-lg",
            variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground",
            className,
          )}
        >
          <div className="grid gap-1">
            {title ? <div className="text-sm font-semibold">{title}</div> : null}
            {description ? <div className="text-sm opacity-90">{description}</div> : null}
          </div>
          {action}
          <button
            type="button"
            aria-label="Cerrar notificacion"
            onClick={() => dismiss(id)}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
