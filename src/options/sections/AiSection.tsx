import { RefreshIcon } from "@hugeicons/core-free-icons";
import { ADAPTERS, PROVIDER_ORDER, pickAdapter, type ProviderId } from "@/ai/providers";
import { Section } from "@/options/components/Section";
import { useModels } from "@/options/hooks/useModels";
import type { AiSettings } from "@/shared/types";
import { Button, ButtonSize, ButtonVariant } from "@/ui/components/Button";
import { Field, Input, Select, Toggle } from "@/ui/components/Field";
import { Icon } from "@/ui/components/Icon";
import { Notice, NoticeTone } from "@/ui/components/Notice";

type AiSectionProps = {
  value: AiSettings;
  onChange: (patch: Partial<AiSettings>) => void;
};

const PROVIDER_OPTIONS = PROVIDER_ORDER.map((id) => ({ value: id, label: ADAPTERS[id].settings.label }));
const MODEL_LIST_ID = "ai-models";

export const AiSection = ({ value, onChange }: AiSectionProps) => {
  const models = useModels();
  const { settings } = pickAdapter(value.provider);

  return (
    <Section
      kicker="Optional"
      title="AI tagging"
      description="Let a model pick tags and a category from the ones you already use. The page text is sent to the provider you choose."
    >
      <Toggle label="Enable AI tagging" checked={value.enabled} onChange={(enabled) => onChange({ enabled })} />

      {value.enabled && (
        <>
          <Field label="Provider" htmlFor="ai-provider" hint={settings.notes}>
            <Select
              id="ai-provider"
              value={value.provider}
              options={PROVIDER_OPTIONS}
              onValue={(provider) => onChange({ provider: provider as ProviderId, model: "" })}
            />
          </Field>
          <Field label={settings.requires.baseUrl ? "Base URL" : "Base URL (optional)"} htmlFor="ai-base">
            <Input
              id="ai-base"
              type="url"
              value={value.baseUrl}
              onValue={(baseUrl) => onChange({ baseUrl })}
              placeholder={settings.defaultBaseUrl ?? "https://api.example.com/v1"}
            />
          </Field>
          <Field label={settings.requires.apiKey ? "API key" : "API key (optional)"} htmlFor="ai-key">
            <Input id="ai-key" type="password" value={value.apiKey} onValue={(apiKey) => onChange({ apiKey })} autoComplete="off" />
          </Field>
          <Field
            label="Model"
            htmlFor="ai-model"
            aside={
              <Button variant={ButtonVariant.Soft} size={ButtonSize.Small} className="h-7 px-2 text-xs" disabled={models.busy} onClick={() => void models.load(value)}>
                <Icon icon={RefreshIcon} spin={models.busy} className="h-3.5 w-3.5" />
                Load models
              </Button>
            }
          >
            <Input id="ai-model" list={MODEL_LIST_ID} value={value.model} onValue={(model) => onChange({ model })} placeholder="Pick or type a model" />
            <datalist id={MODEL_LIST_ID}>
              {models.models.map((model) => (
                <option key={model.value} value={model.value} label={model.label} />
              ))}
            </datalist>
          </Field>
          {models.error && <Notice tone={NoticeTone.Error}>{models.error.message}</Notice>}
          <Toggle
            label="Suggest as soon as the popup opens"
            description="Otherwise use the Suggest button next to Tags."
            checked={value.autoSuggest}
            onChange={(autoSuggest) => onChange({ autoSuggest })}
          />
        </>
      )}
    </Section>
  );
};
