import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";
import { SelectFieldProps } from "../../../shared/select-field/SelectField";


const summarizationMethodSelectOptions: ISelectOption[] = [
    {
        label: "Map Reduce (Recommended)", 
        value: "mapReduce", 
        description: "Summarize each document (or chunk) individually, then summarize those summaries"
    },
    {
        label: "Refine", 
        value: "refine", 
        description: "Summarize the first document (or chunk). Then update that summary based on the next document (for chunk), and repeat"
    },
    {
        label: "Stuff", 
        value: "stuff", 
        description: "Pass all documents (for chunks) at once. Ideal for small datasets"
    },
]

const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    placeholder: "We need to pass Context to LLM",
    isRequired: true,
    className: "text-sm resize-none"
} 

const charactersPerChunkProps: InputFieldProps = {
    name: "charactersPerChunk",
    label: "Characters Per Chunk",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

const chunkOverlapProps: InputFieldProps = {
    name: "chunkOverlap",
    label: "Chunk Overlap (Characters)",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

const totalMinWordsProps: InputFieldProps = {
    name: "totalMinWords",
    label: "Total Minimum Words",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

const totalMaxWordsProps: InputFieldProps = {
    name: "totalMaxWords",
    label: "Total Maximum Words",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

const summarizationMethodProps: SelectFieldProps  = {
    name: "summarizationMethod",
    label: "Summarization Method",
    isRequired: true,
    className: "text-sm",
    placeholder: "Select",
    selectOptions : summarizationMethodSelectOptions
}


const individualSummaryPromptProps: AutosizeTextareaFieldProps = {
    name: "individualSummaryPrompt",
    label: "Individual Summary Prompt",
    minHeight: 10,
    placeholder: "Please provide a summary prompt",
    isRequired: true,
    className: "text-sm resize-none"
} 

const finalPromptToCombineProps: AutosizeTextareaFieldProps = {
    name: "finalPromptToCombine",
    label: "Final Prompt to Combine",
    minHeight: 10,
    placeholder: "Please provide a final prompt",
    isRequired: true,
    className: "text-sm resize-none"
} 

const subsequentPromptProps: AutosizeTextareaFieldProps = {
    name: "subsequentPrompt",
    label: "Subsequent (Refine) Prompt",
    minHeight: 10,
    placeholder: "Please provide a Subsequent Prmpot",
    isRequired: true,
    className: "text-sm resize-none"
} 

const initialPromptProps: AutosizeTextareaFieldProps = {
    name: "initialPrompt",
    label: "Initial Prompt",
    minHeight: 10,
    placeholder: "Please provide an Initial Prmpot",
    isRequired: true,
    className: "text-sm resize-none"
} 

const promptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    minHeight: 10,
    placeholder: "Please provide a Prompt",
    isRequired: true,
    className: "text-sm resize-none"
} 

export {
    contextProps,
    charactersPerChunkProps,
    chunkOverlapProps,
    totalMinWordsProps,
    totalMaxWordsProps,
    summarizationMethodProps,
    individualSummaryPromptProps,
    finalPromptToCombineProps,
    subsequentPromptProps,
    initialPromptProps,
    promptProps
}