import type { ComponentChildren } from "preact";
import { cn } from "@/ui/cn";

type ShellProps = {
  kicker?: ComponentChildren;
  title: ComponentChildren;
  description?: ComponentChildren;
  actions?: ComponentChildren;
  footer?: ComponentChildren;
  className?: string;
  children: ComponentChildren;
};

export const Shell = ({ kicker, title, description, actions, footer, className, children }: ShellProps) => (
  <div className={cn("jotty-modal-content flex min-h-0 flex-col overflow-hidden bg-card text-card-foreground", className)}>
    <div className="h-1 shrink-0 bg-primary/70" />
    <header className="jotty-modal-header flex shrink-0 items-start gap-4 border-b border-dashed border-border px-6 pt-4 pb-4">
      <div className="min-w-0 flex-1">
        {kicker && (
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {kicker}
          </div>
        )}
        <h2 className="jotty-modal-title flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
    <div className="jotty-modal-body scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
      {children}
    </div>
    {footer && (
      <footer className="jotty-modal-footer shrink-0 border-t border-dashed border-border px-6 py-3">{footer}</footer>
    )}
  </div>
);

type ChipProps = {
  onClick?: () => void;
  title?: string;
  children: ComponentChildren;
};

export const Chip = ({ onClick, title, children }: ChipProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-jotty border border-border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
  >
    {children}
  </button>
);
