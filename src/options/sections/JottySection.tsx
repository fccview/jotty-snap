import { PlugSocketIcon } from "@hugeicons/core-free-icons";
import { Section } from "@/options/components/Section";
import { useConnection } from "@/options/hooks/useConnection";
import type { JottySettings } from "@/shared/types";
import { Button, ButtonSize, ButtonVariant } from "@/ui/components/Button";
import { Field, Input } from "@/ui/components/Field";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";

type JottySectionProps = {
  value: JottySettings;
  onChange: (patch: Partial<JottySettings>) => void;
};

export const JottySection = ({ value, onChange }: JottySectionProps) => {
  const connection = useConnection();

  const edit = (patch: Partial<JottySettings>) => {
    connection.reset();
    onChange(patch);
  };

  return (
    <Section
      kicker="Connection"
      title="Your Jotty"
      description="Generate a key in Jotty under Profile, Settings, API Key. The key acts as you, so keep it private."
    >
      <Field label="Jotty address" htmlFor="jotty-url">
        <Input
          id="jotty-url"
          type="url"
          value={value.url}
          onValue={(url) => edit({ url })}
          placeholder="https://jotty.example.com"
          autoComplete="url"
        />
      </Field>
      <Field label="API key" htmlFor="jotty-key">
        <Input
          id="jotty-key"
          type="password"
          value={value.apiKey}
          onValue={(apiKey) => edit({ apiKey })}
          placeholder="ck_..."
          autoComplete="off"
        />
      </Field>
      <div className="flex items-center justify-end">
        <Button variant={ButtonVariant.Soft} size={ButtonSize.Small} disabled={connection.busy} onClick={() => void connection.test(value)}>
          <Icon icon={PlugSocketIcon} spin={connection.busy} />
          {connection.busy ? "Checking" : "Test connection"}
        </Button>
      </div>
      {connection.error && <Notice tone={NoticeTone.Error}>{connection.error.message}</Notice>}
      {connection.identity && (
        <Notice tone={NoticeTone.Success}>
          Connected as <span className="font-medium">{connection.identity.username}</span>
          {connection.identity.version ? ` on Jotty ${connection.identity.version}` : ""}.
        </Notice>
      )}
    </Section>
  );
};
