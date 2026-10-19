import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  BaseFieldProps,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const VOICE_WEBHOOK_URL_NAME = "__TranscriptWebhookUrl__Voice";
const VOICE_WEBHOOK_SECRET_NAME = "__TranscriptWebhookSecret__Voice";
const DEFAULT_URL_PLACEHOLDER = "https://example.com/voice-transcript";
const DEFAULT_SECRET_PLACEHOLDER = "At least 16 characters";

type VoiceWebhookFieldProps = BaseFieldProps & {
  urlName?: string;
  secretName?: string;
  urlLabel?: string;
  urlDescription?: string;
  secretLabel?: string;
  secretDescription?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  urlPlaceholder?: string;
  secretPlaceholder?: string;
};

/** Edits the Voice Agent Transcript Webhook endpoint URL and its optional signing secret. */
export const VoiceWebhookField = ({
  urlName = VOICE_WEBHOOK_URL_NAME,
  secretName = VOICE_WEBHOOK_SECRET_NAME,
  urlLabel,
  urlDescription,
  secretLabel,
  secretDescription,
  disabled,
  size = "sm",
  urlPlaceholder,
  secretPlaceholder,
}: VoiceWebhookFieldProps) => {
  const [showSecret, setShowSecret] = useState(false);
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name={urlName}
        render={({ field }) => (
          <FormItem className="space-y-0 mb-3">
            {urlLabel && (
              <FormLabelExt
                size={size}
                {...{ label: urlLabel, disabled, isRequired: true, description: urlDescription }}
              />
            )}
            <Input
              {...field}
              type="text"
              inputMode="url"
              placeholder={urlPlaceholder ?? DEFAULT_URL_PLACEHOLDER}
              disabled={disabled}
              fieldSize={size}
            />
            <FormMessage size={size} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={secretName}
        render={({ field }) => (
          <FormItem className="space-y-0">
            {secretLabel && (
              <FormLabelExt
                size={size}
                {...{ label: secretLabel, disabled, description: secretDescription }}
              />
            )}
            <div className="flex gap-2 items-center">
              <Input
                {...field}
                type={showSecret ? "text" : "password"}
                placeholder={secretPlaceholder ?? DEFAULT_SECRET_PLACEHOLDER}
                disabled={disabled}
                fieldSize={size}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon7"
                onClick={() => setShowSecret((current) => !current)}
                disabled={disabled}
                aria-label={showSecret ? "Hide signing secret" : "Show signing secret"}
                aria-pressed={showSecret}
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <FormMessage size={size} />
          </FormItem>
        )}
      />
    </>
  );
};
