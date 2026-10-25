import { PlugSocketIcon } from "@hugeicons/core-free-icons";
import { openSettings } from "@/popup/actions";
import { APP_NAME } from "@/shared/consts";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Shell } from "@/ui/components/Shell";

export const ConnectView = () => (
  <Shell
    kicker={APP_NAME}
    title="Connect your Jotty"
    description="Add your Jotty address and API key once, then snap any page in one click."
    footer={
      <div className="flex justify-end">
        <Button onClick={() => void openSettings()}>
          <Icon icon={PlugSocketIcon} />
          Open settings
        </Button>
      </div>
    }
  >
    <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
      <li>In Jotty, open Profile, then Settings, then API Key, and generate a key.</li>
      <li>Paste your Jotty address and the key in the Jotty Snap settings.</li>
      <li>Allow Jotty Snap to talk to your Jotty when the browser asks.</li>
    </ol>
  </Shell>
);
