import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps, CheckboxFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { ToneOfVoiceEnum } from "../enums/tone-of-voice-enums";
import { SliderFieldProps } from "@/shared/Slider/SliderField";
import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";


const personaNameProps: AutosizeTextareaFieldProps = {
    name: "name",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const roleObjectiveProps: AutosizeTextareaFieldProps = {
    name: "roleOrObjective",
    label: "Role/Objective",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const categoryDomainProps: AutosizeTextareaFieldProps = {
    name: "categoryOrDomain",
    label: "Category/Domain",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const toneOfVoiceProps: SelectFieldProps = {
    name: "toneOfVoice",
    label: "Tone of Voice",
    selectOptions: enumToArray(ToneOfVoiceEnum),
    isRequired: true,
    className: "text-sm resize-none",
    placeholder: "Select"
} 

const instructionsProps: AutosizeTextareaFieldProps = {
    name: "instructions",
    label: "Instructions",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const exclusionsBoundariesProps: AutosizeTextareaFieldProps = {
    name: "exclusionsOrBoundaries",
    label: "Exclusions/Boundaries",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const contextMemoryProps: AutosizeTextareaFieldProps = {
    name: "contextMemoryTimeframe",
    label: "Context Memory",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const modelTypeProps: SelectFieldProps = {
    name: "llm",
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
    name: "temperature",
    label: "Temperature",
    className: "text-sm resize-none",
}

const enableAudioProps: CheckboxFieldProps = {
    name: "enableAudio",
    label: "",
    className: "text-sm"
}

const enableVideoProps: CheckboxFieldProps = {
    name: "enableVideo",
    label: "",
    className: "text-sm",
}

const enableChatProps: CheckboxFieldProps = {
    name: "enableChat",
    label: "",
    className: "text-sm"
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
    enableAudioProps,
    enableVideoProps,
    enableChatProps
}