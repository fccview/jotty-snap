import { TextArea } from "@/ui/components/Field";

type PreviewProps = {
  value: string;
  onValue: (value: string) => void;
};

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export const Preview = ({ value, onValue }: PreviewProps) => (
  <div className="space-y-1.5">
    <TextArea
      id="snap-markdown"
      value={value}
      onValue={onValue}
      rows={10}
      spellcheck={false}
      className="font-mono text-xs leading-relaxed"
    />
    <div className="flex justify-end gap-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span>{countWords(value)} words</span>
      <span>{value.length} chars</span>
    </div>
  </div>
);
