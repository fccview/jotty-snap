import { SparklesIcon } from "@hugeicons/core-free-icons";
import { CategoryField } from "@/popup/components/CategoryField";
import { Preview } from "@/popup/components/Preview";
import type { ClipForm } from "@/popup/hooks/useClipForm";
import type { Catalog, ErrorShape } from "@/shared/types";
import { Button, ButtonSize, ButtonVariant } from "@/ui/components/Button";
import { Field, Input } from "@/ui/components/Field";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";
import { TagInput } from "@/ui/components/TagInput";

type ClipFieldsProps = {
  form: ClipForm;
  catalog: Catalog;
  aiReady: boolean;
  suggesting: boolean;
  suggestError: ErrorShape | null;
  onPatch: (next: Partial<ClipForm>) => void;
  onCategory: (category: string) => void;
  onSuggest: () => void;
};

const SuggestButton = ({ busy, onClick }: { busy: boolean; onClick: () => void }) => (
  <Button variant={ButtonVariant.Soft} size={ButtonSize.Small} className="h-7 px-2 text-xs" disabled={busy} onClick={onClick}>
    <Icon icon={SparklesIcon} spin={busy} className="h-3.5 w-3.5" />
    {busy ? "Thinking" : "Suggest"}
  </Button>
);

export const ClipFields = ({
  form,
  catalog,
  aiReady,
  suggesting,
  suggestError,
  onPatch,
  onCategory,
  onSuggest,
}: ClipFieldsProps) => (
  <div className="space-y-5">
    <Field label="Title" htmlFor="snap-title">
      <Input id="snap-title" value={form.title} onValue={(title) => onPatch({ title })} />
    </Field>

    <Field label="Category" htmlFor="snap-category" hint="Type a new path like Reading/Articles to create it.">
      <CategoryField id="snap-category" value={form.category} known={catalog.categories} onValue={onCategory} />
    </Field>

    <Field
      label="Tags"
      htmlFor="snap-tags"
      aside={aiReady ? <SuggestButton busy={suggesting} onClick={onSuggest} /> : null}
    >
      <TagInput id="snap-tags" tags={form.tags} known={catalog.tags} onChange={(tags) => onPatch({ tags })} />
    </Field>
    {suggestError && <Notice tone={NoticeTone.Error}>{suggestError.message}</Notice>}

    <Field label="Markdown" htmlFor="snap-markdown">
      <Preview value={form.markdown} onValue={(markdown) => onPatch({ markdown })} />
    </Field>
  </div>
);
