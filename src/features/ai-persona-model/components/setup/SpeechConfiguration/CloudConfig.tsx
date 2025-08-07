import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";
import { useCloudLanguagesStore } from "@/features/ai-persona-model/store/cloud-languages-store";
import { useVoiceStore } from "@/features/ai-persona-model/store/cloud-voices-store";
import { useSttStore } from "@/features/ai-persona-model/store/speech-to-text-store";
import { useTtsStore } from "@/features/ai-persona-model/store/text-to-speech-store";
import { useToggleCreateNewCredentialsDialogStore } from "@/features/create-new-credentials/store/toggle-add-credentials-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/select-field/Select";

import { Button } from "@aventisia/ui/buttons";
import { FormItem, FormLabel } from "@aventisia/ui/form";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  // Languages Store
  const {
    cloudLanguages,
    fetchCloudLanguages,
    selectedLanguage,
    updateSelectedLanguage,
    loading: languagesLoading,
  } = useCloudLanguagesStore();

  // Speech To Text Store
  const {
    fetchSttOptions,
    loading: sttLoading,
    sttOptions,
    selectedSTTService,
    updateSelectedSTTService,
  } = useSttStore();

  // Text To Speech Store
  const {
    fetchTtsOptions,
    loading: ttsLoading,
    ttsOptions,
    selectedTTSService,
    updateSelectedTTSService,
  } = useTtsStore();

  // Voices Store
  const {
    voicesOptions,
    selectedVoice,
    updateSelectedVoice,
    setVoicesOptions,
    loading: voicesLoading,
    fetchVoiceOptions,
  } = useVoiceStore();

  useEffect(() => {
    fetchCloudLanguages();
  }, []);

  const populateSttTtsFields = useCallback(async () => {
    if (selectedLanguage?.value) {
      await fetchSttOptions(selectedLanguage.value);
      await fetchTtsOptions(selectedLanguage.value);
      updateSelectedVoice(null);
      setVoicesOptions([]);
    }
  }, [
    selectedLanguage?.value,
    fetchSttOptions,
    fetchTtsOptions,
    updateSelectedVoice,
    setVoicesOptions,
  ]);

  useEffect(() => {
    populateSttTtsFields();
  }, [populateSttTtsFields]);

  useEffect(() => {
    if (selectedTTSService?.value) {
      fetchVoiceOptions(selectedTTSService.value);
    }
  }, [selectedTTSService?.value]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 items-center">
        {/* Language Dropdown */}
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Language
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.cloudConfig.language"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={selectedLanguage?.value || ""}
                onValueChange={(val) => {
                  field.onChange(val); // updates the form state
                  const selected =
                    cloudLanguages.find((lang) => lang.value === val) || null;
                  updateSelectedLanguage(selected); // updates Zustand store
                }}
                disabled={cloudLanguages.length === 0 || languagesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {cloudLanguages.map((cred) => (
                    <SelectItem key={cred.value} value={cred.value}>
                      {cred.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>

        {/* Speech to Text */}
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Speech to Text
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.cloudConfig.speechToText.name"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={selectedSTTService?.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  const selected =
                    sttOptions.find((service) => service.value === val) || null;
                  updateSelectedSTTService(selected);
                }}
                open={isSTTOpen}
                onOpenChange={setSTTOpen}
                disabled={!selectedLanguage || sttLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {sttOptions.map((cred) => (
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

      {/* Text to Speech */}
      <div className="grid grid-cols-2 gap-4 items-center">
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Text to Speech
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.cloudConfig.textToSpeech.name"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                open={isTTSOpen}
                onOpenChange={setTTSOpen}
                disabled={!selectedLanguage || ttsLoading}
                value={selectedTTSService?.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  const selected =
                    ttsOptions.find((service) => service.value === val) || null;
                  updateSelectedTTSService(selected);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {ttsOptions.map((cred) => (
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

        {/* Voices based on TTS Service Selected */}
        <FormItem>
          <FormLabel className={"flex items-center gap-0.5 mb-1 px-1"}>
            Voices
          </FormLabel>

          <Controller
            control={control}
            name="aiPersona.setupObject.speechConfiguration.cloudConfig.voice"
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={selectedVoice?.value || ""}
                onValueChange={(val) => {
                  field.onChange(val); // updates the form state
                  const selected =
                    voicesOptions.find((voice) => voice.value === val) || null;
                  updateSelectedVoice(selected); // updates Zustand store
                }}
                disabled={
                  cloudLanguages.length === 0 ||
                  voicesOptions.length === 0 ||
                  languagesLoading ||
                  voicesLoading ||
                  ttsLoading
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {voicesOptions.map((cred) => (
                    <SelectItem key={cred.value} value={cred.value}>
                      {cred.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>
      </div>
    </div>
  );
};

export default CloudConfig;
