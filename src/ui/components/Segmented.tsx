import { cn } from "@/ui/cn";
import { Icon, type IconData } from "@/ui/components/Icon";

export type Segment<T extends string> = {
  value: T;
  label: string;
  icon: IconData;
};

type SegmentedProps<T extends string> = {
  value: T;
  segments: Segment<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

export const Segmented = <T extends string>({ value, segments, onChange, disabled }: SegmentedProps<T>) => (
  <div role="radiogroup" className="grid grid-flow-col auto-cols-fr gap-1 rounded-jotty border border-border bg-background p-1">
    {segments.map((segment) => {
      const active = segment.value === value;
      return (
        <button
          key={segment.value}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          onClick={() => onChange(segment.value)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-jotty px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50",
            active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Icon icon={segment.icon} className="h-3.5 w-3.5" />
          {segment.label}
        </button>
      );
    })}
  </div>
);
