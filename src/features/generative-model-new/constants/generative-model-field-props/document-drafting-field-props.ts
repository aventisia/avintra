import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";

const documentTitleProps: AutosizeTextareaFieldProps = {
    name: "documentTitle",
    label: "Document Title",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const documentTypeProps: AutosizeTextareaFieldProps = {
    name: "documentType",
    label: "Document Type",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const guidelinesProps: AutosizeTextareaFieldProps = {
    name: "guidelines",
    label: "Guidelines / Instructions",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const outputStructureProps: AutosizeTextareaFieldProps = {
    name: "outputStructure",
    label: "Output Structure",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const localizationNeededProps: AutosizeTextareaFieldProps = {
    name: "localizationNeeded",
    label: "Localization Needed",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

export {documentTitleProps, documentTypeProps, guidelinesProps, outputStructureProps, localizationNeededProps}
