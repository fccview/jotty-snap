import { ArrowRight01Icon, Camera01Icon } from "@hugeicons/core-free-icons";
import { closePopup, openTab } from "@/popup/actions";
import { APP_NAME } from "@/shared/consts";
import type { SavedNote } from "@/shared/types";
import { Button, ButtonVariant } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";
import { Chip, Shell } from "@/ui/components/Shell";

type SavedViewProps = {
  note: SavedNote;
  title: string;
  onAgain: () => void;
};

export const SavedView = ({ note, title, onAgain }: SavedViewProps) => (
  <Shell
    kicker={APP_NAME}
    title="Snapped"
    description={`Saved to ${note.category}.`}
    actions={<Chip onClick={closePopup}>esc</Chip>}
    footer={
      <div className="flex justify-end gap-3">
        <Button variant={ButtonVariant.Outline} onClick={onAgain}>
          <Icon icon={Camera01Icon} />
          Snap again
        </Button>
        <Button onClick={() => void openTab(note.url)}>
          Open in Jotty
          <Icon icon={ArrowRight01Icon} />
        </Button>
      </div>
    }
  >
    <Notice tone={NoticeTone.Success}>
      <span className="font-medium">{title}</span> is now a note in Jotty.
    </Notice>
  </Shell>
);
