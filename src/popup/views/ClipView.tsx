import { Note01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { useState } from "preact/hooks";
import { closePopup, openSettings } from "@/popup/actions";
import { CaptureError } from "@/popup/components/CaptureError";
import { ClipFields } from "@/popup/components/ClipFields";
import { Loading } from "@/popup/components/Loading";
import { useCapture } from "@/popup/hooks/useCapture";
import { useCatalog } from "@/popup/hooks/useCatalog";
import { useClipForm } from "@/popup/hooks/useClipForm";
import { useSave } from "@/popup/hooks/useSave";
import { useSuggest } from "@/popup/hooks/useSuggest";
import { MODE_LABELS, MODE_SEGMENTS } from "@/ui/modes";
import { SavedView } from "@/popup/views/SavedView";
import { APP_NAME } from "@/shared/consts";
import type { ClipMode } from "@/shared/enums";
import type { SnapStatus } from "@/shared/types";
import { hostOf } from "@/shared/urls";
import { Button, ButtonSize, ButtonVariant } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";
import { Segmented } from "@/ui/components/Segmented";
import { Chip, Shell } from "@/ui/components/Shell";

type ClipViewProps = {
  status: SnapStatus;
  initialMode: ClipMode;
};

export const ClipView = ({ status, initialMode }: ClipViewProps) => {
  const [mode, setMode] = useState(initialMode);
  const capture = useCapture(mode);
  const { catalog, ready } = useCatalog(true);
  const { form, patch, setCategory, absorb } = useClipForm(capture.data, status);
  const suggest = useSuggest({ page: capture.data, catalog, auto: status.autoSuggest && ready, onSuggest: absorb });
  const saver = useSave();

  if (saver.saved) {
    return (
      <SavedView
        note={saver.saved}
        title={form.title}
        onAgain={() => {
          saver.reset();
          void capture.run(mode);
        }}
      />
    );
  }

  const page = capture.data;
  const canSave = Boolean(page && form.markdown.trim()) && !saver.busy && !capture.busy;

  return (
    <Shell
      kicker={`${APP_NAME} / ${MODE_LABELS[mode]}`}
      title="Snap this page"
      description={page ? page.meta.siteName ?? hostOf(page.meta.url) : "Turning the page into Jotty markdown"}
      actions={
        <>
          <Button variant={ButtonVariant.Ghost} size={ButtonSize.Icon} aria-label="Settings" onClick={() => void openSettings()}>
            <Icon icon={Settings01Icon} className="text-muted-foreground" />
          </Button>
          <Chip onClick={closePopup}>esc</Chip>
        </>
      }
      footer={
        <div className="space-y-3">
          {saver.error && <Notice tone={NoticeTone.Error}>{saver.error.message}</Notice>}
          <div className="flex justify-end gap-3">
            <Button variant={ButtonVariant.Outline} onClick={closePopup}>
              Cancel
            </Button>
            <Button disabled={!canSave} onClick={() => page && void saver.save(form, page)}>
              <Icon icon={Note01Icon} spin={saver.busy} />
              {saver.busy ? "Saving" : "Save to Jotty"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <Segmented value={mode} segments={MODE_SEGMENTS} onChange={setMode} disabled={capture.busy} />
        {capture.busy && <Loading label="Reading the page" />}
        {!capture.busy && capture.error && <CaptureError error={capture.error} onRetry={() => void capture.run(mode)} />}
        {!capture.busy && page && (
          <ClipFields
            form={form}
            catalog={catalog}
            aiReady={status.aiReady}
            suggesting={suggest.busy}
            suggestError={suggest.error}
            onPatch={patch}
            onCategory={setCategory}
            onSuggest={() => void suggest.suggest()}
          />
        )}
      </div>
    </Shell>
  );
};
