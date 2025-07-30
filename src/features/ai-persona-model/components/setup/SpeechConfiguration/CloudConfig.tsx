import {
  languageProps,
  voiceProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";
import { SpeechToTextModelEnum } from "@/features/ai-persona-model/enums/speech-to-text-model";
import { TextToSpeechModelEnum } from "@/features/ai-persona-model/enums/text-to-speech-model";
import { useToggleCreateNewCredentialsDialogStore } from "@/features/create-new-credentials/store/toggle-add-credentials-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/select-field/Select";
import { SelectField } from "@/shared/select-field/SelectField";

import { Button } from "@aventisia/ui/buttons";
import { FormItem, FormLabel } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof aiPersonaSetupFormZodSchema>;

type CloudConfigFieldProps = {
  form: UseFormReturn<FormSchema>;
};

const CloudConfig = ({ form }: CloudConfigFieldProps) => {
  const { setShowCreateNewCredentialsDialog } =
    useToggleCreateNewCredentialsDialogStore();
  const { control } = form;

  const [isTTSOpen, setTTSOpen] = useState(false);
  const [isSTTOpen, setSTTOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 items-center">
        <SelectField {...languageProps} />
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Speech to Text
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.speechToText"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                open={isSTTOpen}
                onOpenChange={setSTTOpen}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {enumToArray(SpeechToTextModelEnum).map((cred) => (
                    <SelectItem key={cred.value} value={cred.value}>
                      {cred.label}
                    </SelectItem>
                  ))}
                  <Button
                    className="w-full bg-primary-foreground gap-1 hover:text-primary"
                    variant={"outline"}
                    onClick={() => {
                      setSTTOpen(false);
                      setShowCreateNewCredentialsDialog(true);
                    }}
                  >
                    <Plus size={18} /> Create New Credential
                  </Button>
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Text to Speech
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.textToSpeech"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                open={isTTSOpen}
                onOpenChange={setTTSOpen}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {enumToArray(TextToSpeechModelEnum).map((cred) => (
                    <SelectItem key={cred.value} value={cred.value}>
                      {cred.label}
                    </SelectItem>
                  ))}
                  <Button
                    className="w-full bg-primary-foreground gap-1 hover:text-primary"
                    variant={"outline"}
                    onClick={() => {
                      setTTSOpen(false);
                      setShowCreateNewCredentialsDialog(true);
                    }}
                  >
                    <Plus size={18} /> Create New Credential
                  </Button>
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>

        <SelectField {...voiceProps} />
      </div>
    </div>
  );
};

export default CloudConfig;
