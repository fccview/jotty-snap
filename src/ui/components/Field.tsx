import type { ComponentChildren, InputHTMLAttributes } from "preact";
import { cn } from "@/ui/cn";

export const INPUT_CLASS =
  "w-full px-4 py-2.5 bg-background border border-input rounded-jotty text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-60";

type FieldProps = {
  label: string;
  hint?: ComponentChildren;
  htmlFor?: string;
  aside?: ComponentChildren;
  children: ComponentChildren;
};

export const Field = ({ label, hint, htmlFor, aside, children }: FieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-muted-foreground">
        {label}
      </label>
      {aside}
    </div>
    {children}
    {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
  </div>
);

export type InputKind = "text" | "url" | "password";

type InputProps = {
  id?: string;
  value: string;
  onValue: (value: string) => void;
  type?: InputKind;
  placeholder?: string;
  disabled?: boolean;
  list?: string;
  autoComplete?: string;
  className?: string;
};

export const Input = ({ value, onValue, className, type = "text", ...rest }: InputProps) => {
  const attrs = { ...rest, type } as InputHTMLAttributes<HTMLInputElement>;
  return (
    <input
      {...attrs}
      className={cn(INPUT_CLASS, className)}
      value={value}
      onInput={(event) => onValue(event.currentTarget.value)}
    />
  );
};

type TextAreaProps = {
  id?: string;
  value: string;
  onValue: (value: string) => void;
  rows?: number;
  spellcheck?: boolean;
  className?: string;
};

export const TextArea = ({ value, onValue, className, ...rest }: TextAreaProps) => (
  <textarea
    className={cn(INPUT_CLASS, "scroll-thin resize-none", className)}
    value={value}
    onInput={(event) => onValue(event.currentTarget.value)}
    {...rest}
  />
);

type SelectOption = { value: string; label: string };

type SelectProps = {
  id?: string;
  value: string;
  options: SelectOption[];
  onValue: (value: string) => void;
  disabled?: boolean;
};

export const Select = ({ id, value, options, onValue, disabled }: SelectProps) => (
  <select
    id={id}
    className={cn(INPUT_CLASS, "appearance-none pr-10 bg-no-repeat")}
    value={value}
    disabled={disabled}
    onChange={(event) => onValue(event.currentTarget.value)}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

type ToggleProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({ label, description, checked, onChange }: ToggleProps) => (
  <label className="flex cursor-pointer items-start justify-between gap-4">
    <span className="min-w-0">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
    </span>
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform peer-checked:translate-x-4" />
    </span>
  </label>
);
