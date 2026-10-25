import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useState } from "preact/hooks";
import { toTag } from "@/jotty/tags";
import { INPUT_CLASS } from "@/ui/components/Field";
import { Icon } from "@/ui/components/Icon";
import { cn } from "@/ui/cn";

type TagInputProps = {
  id?: string;
  tags: string[];
  known: string[];
  onChange: (tags: string[]) => void;
};

const SPLIT_KEYS = new Set(["Enter", ",", " ", "Tab"]);
const LIST_ID = "snap-known-tags";

export const TagInput = ({ id, tags, known, onChange }: TagInputProps) => {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = toTag(draft);
    setDraft("");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
  };

  const drop = (tag: string) => onChange(tags.filter((item) => item !== tag));

  const onKeyDown = (event: KeyboardEvent) => {
    if (SPLIT_KEYS.has(event.key) && draft.trim()) {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Backspace" && !draft && tags.length > 0) drop(tags[tags.length - 1] ?? "");
  };

  return (
    <div className={cn(INPUT_CLASS, "flex flex-wrap items-center gap-1.5 px-2 py-2 focus-within:border-primary/60")}>
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-jotty bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          #{tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => drop(tag)} className="cursor-pointer opacity-70 hover:opacity-100">
            <Icon icon={Cancel01Icon} className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        list={LIST_ID}
        value={draft}
        placeholder={tags.length ? "" : "Add a tag"}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        className="min-w-[6rem] flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <datalist id={LIST_ID}>
        {known.filter((tag) => !tags.includes(tag)).map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
    </div>
  );
};
