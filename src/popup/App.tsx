import { useBoot } from "@/popup/hooks/useBoot";
import { Loading } from "@/popup/components/Loading";
import { ClipView } from "@/popup/views/ClipView";
import { ConnectView } from "@/popup/views/ConnectView";
import { Notice, NoticeTone } from "@/ui/components/Notice";
import { useJottyTheme } from "@/ui/hooks/useJottyTheme";

export const App = () => {
  const { status, mode, failed } = useBoot();
  useJottyTheme(Boolean(status?.configured));

  if (failed) {
    return (
      <div className="p-6">
        <Notice tone={NoticeTone.Error}>Jotty Snap could not start. Try reopening it.</Notice>
      </div>
    );
  }
  if (!status || !mode) return <Loading label="Waking up" />;
  if (!status.configured) return <ConnectView />;
  return <ClipView status={status} initialMode={mode} />;
};
