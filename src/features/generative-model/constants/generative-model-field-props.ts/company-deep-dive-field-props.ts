import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "companyDeepDives.companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const websiteLinkProps: AutosizeTextareaFieldProps = {
    name: "companyDeepDives.websiteLink",
    label: "Website Link",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const focusAreaProps: SelectFieldProps = {
    name: "companyDeepDives.focusAreas",
    label: "Focus Area",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const webDataProps: SelectFieldProps = {
    name: "companyDeepDives.webData",
    label: "Web Data",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const summaryDepthProps: SelectFieldProps = {
    name: "companyDeepDives.summaryDepth",
    label: "Summary Depth",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

// const companyDeepDivesSchema = llmConfigZodSchema.extend({
//     companyName: z.string().min(1, {message: reqError("Company Name")}),
//     websiteLink: z.string().min(1, {message: reqError("Website Link")}),
//     focusAreas: z.string().min(1, {message: reqError("Focus Area")}),
//     webData: z.string().min(1, {message: reqError("Web Data")}),
//     links: z.array(linksSchema),
//     documents: z.array(documentInstructionSchema).nullable(),
//     summaryDepth: z.string().min(1, {message: reqError("Summary Depth")}),
// })

export {companyNameProps, websiteLinkProps, focusAreaProps, webDataProps,summaryDepthProps}