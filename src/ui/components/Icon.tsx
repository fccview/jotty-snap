import { cn } from "@/ui/cn";

export type IconData =
  | [string, { [key: string]: string | number }][]
  | readonly (readonly [string, { readonly [key: string]: string | number }])[];

type IconProps = {
  icon: IconData;
  className?: string;
  spin?: boolean;
};

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const toAttrs = (attrs: { readonly [key: string]: string | number }) =>
  Object.fromEntries(
    Object.entries(attrs)
      .filter(([name]) => name !== "key")
      .map(([name, value]) => [kebab(name), value]),
  );

export const Icon = ({ icon, className, spin = false }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cn("h-4 w-4 shrink-0", spin && "animate-spin", className)}
  >
    {icon.map(([tag, attrs], index) => {
      const Tag = tag as "path";
      return <Tag key={index} {...toAttrs(attrs)} />;
    })}
  </svg>
);
