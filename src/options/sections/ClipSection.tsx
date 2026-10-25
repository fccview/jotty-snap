import { Section } from "@/options/components/Section";
import { MODE_SEGMENTS } from "@/ui/modes";
import type { ClipSettings } from "@/shared/types";
import { Field, Input, Toggle } from "@/ui/components/Field";
import { Segmented } from "@/ui/components/Segmented";
import { TagInput } from "@/ui/components/TagInput";

type ClipSectionProps = {
  value: ClipSettings;
  onChange: (patch: Partial<ClipSettings>) => void;
};

export const ClipSection = ({ value, onChange }: ClipSectionProps) => (
  <Section kicker="Snapping" title="Defaults" description="What every new snap starts with. You can change all of it in the popup.">
    <Field label="Default mode">
      <Segmented value={value.defaultMode} segments={MODE_SEGMENTS} onChange={(defaultMode) => onChange({ defaultMode })} />
    </Field>
    <Field label="Default category" htmlFor="clip-category" hint="Missing categories are created when the first note lands in them.">
      <Input
        id="clip-category"
        value={value.defaultCategory}
        onValue={(defaultCategory) => onChange({ defaultCategory })}
        placeholder="Uncategorized"
      />
    </Field>
    <Field label="Default tags" htmlFor="clip-tags">
      <TagInput id="clip-tags" tags={value.defaultTags} known={[]} onChange={(defaultTags) => onChange({ defaultTags })} />
    </Field>
    <Toggle
      label="Keep page details"
      description="Stores the source URL, site, author and dates in the note frontmatter."
      checked={value.frontmatter}
      onChange={(frontmatter) => onChange({ frontmatter })}
    />
    <Toggle
      label="Add a source link"
      description="Ends the note with a visible link back to the page."
      checked={value.sourceLink}
      onChange={(sourceLink) => onChange({ sourceLink })}
    />
  </Section>
);
