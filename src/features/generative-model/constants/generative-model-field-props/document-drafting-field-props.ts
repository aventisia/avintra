import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";

const documentTitleProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.documentTitle",
    label: "Document Title",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const documentTypeProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.documentType",
    label: "Document Type",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const guidelinesProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.guidelineInstruction",
    label: "Guidelines / Instructions",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const outputStructureProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.outputStructure",
    label: "Output Structure",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const localizationNeededProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.localizationNeeded",
    label: "Localization Needed",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

export {documentTitleProps, documentTypeProps, guidelinesProps, outputStructureProps, localizationNeededProps}
