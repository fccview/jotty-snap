import { Input } from "@/ui/components/Field";

type CategoryFieldProps = {
  id: string;
  value: string;
  known: string[];
  onValue: (value: string) => void;
};

const LIST_ID = "snap-known-categories";

export const CategoryField = ({ id, value, known, onValue }: CategoryFieldProps) => (
  <>
    <Input id={id} list={LIST_ID} value={value} onValue={onValue} placeholder="Uncategorized" autoComplete="off" />
    <datalist id={LIST_ID}>
      {known.map((path) => (
        <option key={path} value={path} />
      ))}
    </datalist>
  </>
);
