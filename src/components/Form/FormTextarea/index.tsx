import { useContext, forwardRef } from "react";
import { formInlineContext } from "../FormInline";
import { inputGroupContext } from "../InputGroup";
import { twMerge } from "tailwind-merge";

interface FormTextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  formTextareaSize?: "sm" | "lg";
  rounded?: boolean;
}

type FormTextareaRef = React.ComponentPropsWithRef<"textarea">["ref"];

const FormTextarea = forwardRef(
  (props: FormTextareaProps, ref: FormTextareaRef) => {
    const formInline = useContext(formInlineContext);
    const inputGroup = useContext(inputGroupContext);
    const { formTextareaSize, rounded, ...computedProps } = props;
    return (
      <textarea
        {...computedProps}
        ref={ref}
        className={twMerge([
          "dark:disabled:bg-darkmode-700/50 disabled:cursor-not-allowed disabled:bg-slate-100",
          "[&[readonly]]:dark:bg-darkmode-700/50 [&[readonly]]:cursor-not-allowed [&[readonly]]:bg-slate-100",
          "dark:bg-darkmode-700 w-full rounded-md border-slate-300/60 text-sm shadow-sm transition duration-200 ease-in-out placeholder:text-slate-400/90 focus:border-primary focus:border-opacity-40 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:placeholder:text-slate-500/80 dark:focus:ring-slate-700 dark:focus:ring-opacity-50",
          formTextareaSize == "sm" && "px-2 py-1.5 text-xs",
          formTextareaSize == "lg" && "px-4 py-1.5 text-lg",
          rounded && "rounded-full",
          formInline && "flex-1",
          inputGroup &&
            "z-10 rounded-none first:rounded-l last:rounded-r [&:not(:first-child)]:border-l-transparent",
          props.className,
        ])}
      />
    );
  },
);

export default FormTextarea;
