import { InputFieldProps } from "@aventisia/ui/form";

import { RichTextAreaFieldProps } from "../components/richtextarea/RichTextAreaField";

// Remark Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Remark Id",
  disabled: true,
};

// Message
const messageProps: InputFieldProps = {
  name: "message",
  label: "Message",
  isRequired: true,
};

// Description
const descriptionProps: RichTextAreaFieldProps = {
  name: "message",
  placeholder: "Add your comment here...",
  output: "html",
};

export { idProps, messageProps, descriptionProps };
