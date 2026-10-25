import { Tick02Icon } from "@hugeicons/core-free-icons";
import { useDraft } from "@/options/hooks/useDraft";
import { AiSection } from "@/options/sections/AiSection";
import { ClipSection } from "@/options/sections/ClipSection";
import { JottySection } from "@/options/sections/JottySection";
import { APP_NAME } from "@/shared/consts";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";
import { useJottyTheme } from "@/ui/hooks/useJottyTheme";

const SaveBar = ({ draft }: { draft: ReturnType<typeof useDraft> }) => (
  <div className="sticky bottom-0 -mx-4 border-t border-dashed border-border bg-card/95 px-4 py-3 backdrop-blur">
    <div className="mx-auto flex max-w-2xl items-center justify-end gap-3">
      {draft.savedOnce && <span className="text-sm text-muted-foreground">Saved</span>}
      {draft.dirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
      <Button disabled={draft.saving || !draft.dirty} onClick={() => void draft.save()}>
        <Icon icon={Tick02Icon} spin={draft.saving} />
        {draft.saving ? "Saving" : "Save settings"}
      </Button>
    </div>
  </div>
);

export const App = () => {
  const draft = useDraft();
  useJottyTheme(draft.loaded && Boolean(draft.draft.jotty.url && draft.draft.jotty.apiKey));

  if (!draft.loaded) return null;

  return (
    <div className="relative min-h-screen bg-background px-4">
      <div aria-hidden="true" className="jotty-paper pointer-events-none fixed inset-0" />
      <main className="relative mx-auto max-w-2xl space-y-6 py-10">
        <header>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Settings</div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Snap any page into Jotty as clean, Jotty-native markdown.</p>
        </header>
        <JottySection value={draft.draft.jotty} onChange={draft.editJotty} />
        <ClipSection value={draft.draft.clip} onChange={draft.editClip} />
        <AiSection value={draft.draft.ai} onChange={draft.editAi} />
        {draft.saveError && <Notice tone={NoticeTone.Error}>{draft.saveError.message}</Notice>}
      </main>
      <SaveBar draft={draft} />
    </div>
  );
};
