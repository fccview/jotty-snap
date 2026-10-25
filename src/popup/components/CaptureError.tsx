import { RefreshIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { openSettings } from "@/popup/actions";
import { ErrorCode } from "@/shared/enums";
import type { ErrorShape } from "@/shared/types";
import { Button, ButtonSize, ButtonVariant } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";

const SETTINGS_CODES = new Set([ErrorCode.NotConfigured, ErrorCode.NoPermission, ErrorCode.Unauthorized]);

type CaptureErrorProps = {
  error: ErrorShape;
  onRetry: () => void;
};

export const CaptureError = ({ error, onRetry }: CaptureErrorProps) => (
  <div className="space-y-3">
    <Notice tone={NoticeTone.Error}>{error.message}</Notice>
    <div className="flex justify-end gap-2">
      {SETTINGS_CODES.has(error.code) && (
        <Button variant={ButtonVariant.Outline} size={ButtonSize.Small} onClick={() => void openSettings()}>
          <Icon icon={Settings01Icon} />
          Settings
        </Button>
      )}
      <Button variant={ButtonVariant.Soft} size={ButtonSize.Small} onClick={onRetry}>
        <Icon icon={RefreshIcon} />
        Try again
      </Button>
    </div>
  </div>
);
