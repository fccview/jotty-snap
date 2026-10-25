import { Alert02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentChildren } from "preact";
import { cn } from "@/ui/cn";
import { Icon } from "@/ui/components/Icon";

export enum NoticeTone {
  Error = "error",
  Success = "success",
  Info = "info",
}

const TONES: Record<NoticeTone, string> = {
  [NoticeTone.Error]: "border-destructive/40 bg-destructive/10 text-destructive",
  [NoticeTone.Success]: "border-primary/40 bg-primary/10 text-primary",
  [NoticeTone.Info]: "border-border bg-muted/50 text-muted-foreground",
};

type NoticeProps = {
  tone: NoticeTone;
  children: ComponentChildren;
};

export const Notice = ({ tone, children }: NoticeProps) => (
  <div role={tone === NoticeTone.Error ? "alert" : "status"} className={cn("flex items-start gap-2 rounded-jotty border px-3 py-2.5 text-sm", TONES[tone])}>
    <Icon icon={tone === NoticeTone.Success ? Tick02Icon : Alert02Icon} className="mt-0.5" />
    <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
  </div>
);
