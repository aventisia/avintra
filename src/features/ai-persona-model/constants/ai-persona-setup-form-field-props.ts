import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { ToneOfVoiceEnum } from "../enums/tone-of-voice-enums";
import { SliderFieldProps } from "@/shared/Slider/SliderField";
import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
import { LanguageEnum } from "../enums/language-enum";
import { VoiceEnum } from "../enums/voice-enum";
import { TextToSpeechModelEnum } from "../enums/text-to-speech-model";
import { SpeechToTextModelEnum } from "../enums/speech-to-text-model";
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { getAiPersonaLanguageList, getAiPersonaSpeechToTextServicesList, getAiPersonaTextToSpeechServicesList } from "../apis/ai-persona-setup-api";


const personaNameProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.name",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const roleObjectiveProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.roleOrObjective",
    label: "Role/Objective",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const categoryDomainProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.categoryOrDomain",
    label: "Category/Domain",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const toneOfVoiceProps: SelectFieldProps = {
    name: "aiPersona.setupObject.toneOfVoice",
    label: "Tone of Voice",
    selectOptions: enumToArray(ToneOfVoiceEnum),
    isRequired: true,
    className: "text-sm resize-none",
    placeholder: "Select"
} 

const instructionsProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.instructions",
    label: "Instructions",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const exclusionsBoundariesProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.exclusionsOrBoundaries",
    label: "Exclusions/Boundaries",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const contextMemoryProps: AutosizeTextareaFieldProps = {
    name: "aiPersona.setupObject.contextMemoryTimeframe",
    label: "Context Memory",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const modelTypeProps: SelectFieldProps = {
    name: "aiPersona.llm",
    label: "Model",
    selectOptions: enumToArray(ModelLLMEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
} 

const fileNameProps : AutosizeTextareaFieldProps = {
    name: "",
    // isRequired: true,
    minHeight: 10,
    className: "text-sm resize-none",
    rows:2
}

const fileinstructionsProps: AutosizeTextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    minHeight: 10,
}

const temperatureProps: SliderFieldProps = {
    name: "aiPersona.temperature",
    label: "Temperature",
    className: "text-sm resize-none",
}

const languageProps: SelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.language",
    label: "Language",
    className: "text-sm",
    selectOptions : enumToArray(LanguageEnum),
    placeholder: "Select"
}

const voiceProps: SelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.voice",
    label: "Voices",
    className: "text-sm",
    selectOptions : enumToArray(VoiceEnum),
    placeholder: "Select"
}

// Language Async Select Field
const languageAsyncProps: AsyncSelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.language",
    label: "Language",
    className: "text-sm !w-full",
    triggerClassName: "!w-full mt-0.5",
    placeholder: "Select",
    size: "base",
    selectOptions: () => getAiPersonaLanguageList().then((data) => data.data),
}

const textToSpeechProps: SelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.textToSpeech",
    label: "Text to Speech",
    className: "text-sm",
    selectOptions : enumToArray(TextToSpeechModelEnum),
    placeholder: "Select"
}

// TTS Async select field
const textToSpeechAsyncProps: AsyncSelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.textToSpeech",
    label: "Text to Speech",
    className: "text-sm !w-full",
    triggerClassName: "!w-full mt-0.5",
    size: "base",
    selectOptions: () => getAiPersonaTextToSpeechServicesList().then((data) => data.data),
    placeholder: "Select"
}

const speechToTextProps: SelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.speechToText",
    label: "Speech to Text",
    className: "text-sm",
    selectOptions : enumToArray(SpeechToTextModelEnum),
    placeholder: "Select"
}

// STT Async select field
const speechToTextAsyncProps: AsyncSelectFieldProps = {
    name: "aiPersona.setupObject.speechConfiguration.speechToText",
    label: "Speech to Text",
    className: "text-sm !w-full",
    triggerClassName: "!w-full mt-0.5",
    size: "base",
    selectOptions: () => getAiPersonaSpeechToTextServicesList().then((data) => data.data),
    placeholder: "Select"
}

export {
    personaNameProps,
    roleObjectiveProps,
    categoryDomainProps,
    toneOfVoiceProps,
    instructionsProps,
    exclusionsBoundariesProps,
    contextMemoryProps,
    modelTypeProps,
    fileNameProps,
    fileinstructionsProps,
    temperatureProps,
    languageProps,
    voiceProps,
    textToSpeechProps,
    speechToTextProps,
    languageAsyncProps,
    textToSpeechAsyncProps,
    speechToTextAsyncProps
}