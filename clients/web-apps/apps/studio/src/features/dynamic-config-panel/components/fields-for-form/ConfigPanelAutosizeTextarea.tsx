// Code available at: https://shadcnui-expansions.typeart.cc/docs/autosize-textarea
import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType } from "@avplatform/ui/types";
import * as React from "react";
import { useEffect, useImperativeHandle, useState } from "react";

interface UseAutosizeTextAreaProps {
  textAreaRef: HTMLTextAreaElement | null;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
}

const useAutosizeTextarea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutosizeTextAreaProps) => {
  const [init, setInit] = useState(true);
  useEffect(() => {
    // We need to reset the height momentarily to get the correct scrollHeight for the textarea
    const offsetBorder = 2;
    if (textAreaRef) {
      if (init) {
        textAreaRef.style.minHeight = `${minHeight + offsetBorder}px`;
        if (maxHeight > minHeight) {
          textAreaRef.style.maxHeight = `${maxHeight}px`;
        }
        setInit(false);
      }
      textAreaRef.style.height = `${minHeight + offsetBorder}px`;
      const scrollHeight = textAreaRef.scrollHeight;
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      if (scrollHeight > maxHeight) {
        textAreaRef.style.height = `${maxHeight}px`;
      } else {
        textAreaRef.style.height = `${scrollHeight + offsetBorder}px`;
      }
    }
  }, [init, maxHeight, minHeight, textAreaRef, triggerAutoSize]);
};

type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
};

type ConfigPanelAutosizeTextareaProps = {
  minHeight: number;
  maxHeight?: number;
  size?: FormFieldSizeType;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * A React component for a textarea that automatically adjusts its height
 * based on the content, with support for customizable minimum and maximum heights.
 */
const ConfigPanelAutosizeTextarea = React.forwardRef<
  AutosizeTextAreaRef,
  ConfigPanelAutosizeTextareaProps
>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 0,
      size = "base",
      className,
      onChange,
      value,
      ...props
    }: ConfigPanelAutosizeTextareaProps,
    ref: React.Ref<AutosizeTextAreaRef>,
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState("");

    useAutosizeTextarea({
      textAreaRef: textAreaRef.current,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef.current?.focus(),
      maxHeight,
      minHeight,
    }));

    React.useEffect(() => {
      setTriggerAutoSize(value as string);
    }, [props?.defaultValue, value]);

    return (
      <textarea
        {...props}
        value={value}
        ref={textAreaRef}
        className={cn(
          "flex w-full resize-none rounded-lg border border-input bg-background ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
          size === "xs" && "px-[0.45rem] py-1 text-2xs",
          size === "sm" && "px-[0.55rem] py-[0.4rem] text-xs",
          size === "base" && "px-3 py-[0.55rem] text-sm",
          className,
        )}
        onChange={(e) => {
          setTriggerAutoSize(e.target.value);
          onChange?.(e);
        }}
      />
    );
  },
);

ConfigPanelAutosizeTextarea.displayName = "ConfigPanelAutosizeTextarea";

export { ConfigPanelAutosizeTextarea, type ConfigPanelAutosizeTextareaProps };
