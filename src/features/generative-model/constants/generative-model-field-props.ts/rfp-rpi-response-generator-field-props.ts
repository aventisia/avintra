import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const clientNameProps: AutosizeTextareaFieldProps = {
    name: "rfpRpiResponseGenerator.clientName",
    label: "Client / Bidder Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const clientLinkProps: AutosizeTextareaFieldProps = {
    name: "rfpRpiResponseGenerator.clientLink",
    label: "Client / Bidder Website Link",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const responseStrategyProps: SelectFieldProps = {
    name: "rfpRpiResponseGenerator.responseStrategy",
    label: "Response Strategy",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const responseBoundariesProps: SelectFieldProps = {
    name: "rfpRpiResponseGenerator.responseBoundaries",
    label: "Response Boundaries",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {clientNameProps, clientLinkProps, responseStrategyProps, responseBoundariesProps}

// const rfpRpiResponseGeneratorSchema = llmConfigZodSchema.extend({
//     clientName:  z.string().min(1, {message: reqError("Client Name")}),
//     clientLink:  z.string().min(1, {message: reqError("Client Link")}),
//     uploadDocument: z.string().min(1, {message: reqError("Upload Documents")}),
//     responseStrategy: z.string().min(1, {message: reqError("Response Strategy")}),
//     links: z.array(linksSchema),
//     responseBoundaries: z.string().min(1, {message: reqError("Response Boundaries")}),
//     documents: z.array(documentInstructionSchema).nullable(),
// })