import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/ui/components/Icon";

type LoadingProps = {
  label: string;
};

export const Loading = ({ label }: LoadingProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
    <Icon icon={Loading03Icon} spin className="h-6 w-6 text-primary" />
    <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
  </div>
);
