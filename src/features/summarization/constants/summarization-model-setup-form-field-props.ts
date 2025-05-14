import { InputFieldProps, SelectFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";


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

const contextProps: TextareaFieldProps = {
    name: "context",
    label: "Context",
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

const summarizationMethodProps: SelectFieldProps = {
    name: "summarizationMethod",
    label: "Summarization Method",
    isRequired: true,
    className: "text-sm",
    placeholder: "Select",
    selectOptions : summarizationMethodSelectOptions
}


const individualSummaryPromptProps: TextareaFieldProps = {
    name: "individualSummaryPrompt",
    label: "Individual Summary Prompt",
    placeholder: "Please provide a summary prompt",
    isRequired: true,
    className: "text-sm resize-none"
} 

const finalPromptToCombineProps: TextareaFieldProps = {
    name: "finalPromptToCombine",
    label: "Final Prompt to Combine",
    placeholder: "Please provide a final prompt",
    isRequired: true,
    className: "text-sm resize-none"
} 

const subsequentPromptProps: TextareaFieldProps = {
    name: "subsequentPrompt",
    label: "Subsequent (Refine) Prompt",
    placeholder: "Please provide a Subsequent Prmpot",
    isRequired: true,
    className: "text-sm resize-none"
} 

const initialPromptProps: TextareaFieldProps = {
    name: "initialPrompt",
    label: "Initial Prompt",
    placeholder: "Please provide an Initial Prmpot",
    isRequired: true,
    className: "text-sm resize-none"
} 

const promptProps: TextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
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