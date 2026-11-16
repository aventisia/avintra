// Code available at: https://shadcnui-expansions.typeart.cc/docs/autosize-textarea
import * as React from "react";
import { useEffect, useImperativeHandle, useState } from "react";

import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

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

type AutosizeTextAreaProps = {
  minHeight: number;
  maxHeight?: number;
  size?: FormFieldSizeType;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * A React component for a textarea that automatically adjusts its height
 * based on the content, with support for customizable minimum and maximum heights.
 */
const AutosizeTextarea = React.forwardRef<AutosizeTextAreaRef, AutosizeTextAreaProps>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 0,
      size = "base",
      className,
      onChange,
      value,
      ...props
    }: AutosizeTextAreaProps,
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
          "flex w-full resize-none rounded-md border border-line-strong bg-surface text-ink transition-[border-color,box-shadow] duration-[120ms] ease-out placeholder:text-muted-foreground focus-visible:border-focus focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] aria-[invalid=true]:border-bad aria-[invalid=true]:focus-visible:ring-bad/[0.24] disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:text-muted-foreground motion-reduce:transition-none",
          size === "xs" && "px-2 py-0.5 text-hint",
          size === "sm" && "px-2.5 py-1 text-body-sm",
          size === "base" && "px-[11px] py-1.5 text-body",
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

AutosizeTextarea.displayName = "AutosizeTextarea";

export { AutosizeTextarea, type AutosizeTextAreaProps };
