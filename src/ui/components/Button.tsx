import type { ButtonHTMLAttributes, ComponentChildren } from "preact";
import { cn } from "@/ui/cn";

export enum ButtonVariant {
  Default = "default",
  Outline = "outline",
  Ghost = "ghost",
  Soft = "soft",
  Secondary = "secondary",
  Destructive = "destructive",
}

export enum ButtonSize {
  Default = "default",
  Small = "sm",
  Icon = "icon",
}

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-jotty text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const VARIANTS: Record<ButtonVariant, string> = {
  [ButtonVariant.Default]: "bg-primary text-primary-foreground hover:bg-primary/90",
  [ButtonVariant.Outline]: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  [ButtonVariant.Ghost]: "hover:bg-accent hover:text-accent-foreground",
  [ButtonVariant.Soft]: "bg-primary/10 text-primary hover:bg-primary/15",
  [ButtonVariant.Secondary]: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  [ButtonVariant.Destructive]: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const SIZES: Record<ButtonSize, string> = {
  [ButtonSize.Default]: "h-10 px-4 py-2",
  [ButtonSize.Small]: "h-9 px-3",
  [ButtonSize.Icon]: "h-8 w-8 p-0",
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit";
  children?: ComponentChildren;
};

export const Button = ({
  variant = ButtonVariant.Default,
  size = ButtonSize.Default,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className as string)} {...rest}>
    {children}
  </button>
);
