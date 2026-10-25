import type { ComponentChildren } from "preact";

type SectionProps = {
  kicker: string;
  title: string;
  description?: ComponentChildren;
  children: ComponentChildren;
};

export const Section = ({ kicker, title, description, children }: SectionProps) => (
  <section className="overflow-hidden rounded-jotty border border-border bg-card shadow-sm">
    <div className="h-1 bg-primary/70" />
    <header className="border-b border-dashed border-border px-6 pt-4 pb-4">
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{kicker}</div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </header>
    <div className="space-y-5 px-6 py-5">{children}</div>
  </section>
);
