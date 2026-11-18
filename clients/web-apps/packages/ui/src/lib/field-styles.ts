// IMPORTANT NOTE: every form control draws its border, hover, focus, invalid, and disabled looks
// from these strings, so the field look changes here once for every app. Extend these instead of
// restyling a control's border locally. Hover comes before focus and disabled in the Tailwind
// variant order, so focus, error, and disabled states win over hover without extra work, except
// where a stacked variant below says otherwise.
import { cn } from "./utils";

const TRANSITION =
  "transition-[border-color,box-shadow] duration-[120ms] ease-out motion-reduce:transition-none";

/** A control whose own element takes focus: input, textarea, select trigger. */
export const FIELD_SURFACE = `rounded-md border border-line-field bg-surface text-ink ${TRANSITION} hover:border-line-field-hover focus-visible:border-focus focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] aria-[invalid=true]:border-bad aria-[invalid=true]:hover:border-bad aria-[invalid=true]:focus-visible:ring-bad/[0.24] disabled:cursor-not-allowed disabled:border-line disabled:hover:border-line disabled:bg-sunken disabled:text-muted-foreground`;

/** A box whose child takes focus: tag input, multi-select, input group, slider. */
export const FIELD_CONTAINER = `rounded-md border border-line-field bg-surface text-ink ${TRANSITION} hover:border-line-field-hover focus-within:border-focus focus-within:hover:border-focus focus-within:ring-[3px] focus-within:ring-focus/[0.28]`;

/** Swapped in for FIELD_CONTAINER's border and background when the box is disabled. */
export const FIELD_CONTAINER_DISABLED =
  "cursor-not-allowed border-line bg-sunken text-muted-foreground hover:border-line focus-within:hover:border-line";

/** A trigger that opens a popover or listbox, so it shows the focus look while open. */
export const FIELD_OPEN =
  "data-[state=open]:border-focus data-[state=open]:hover:border-focus data-[state=open]:ring-[3px] data-[state=open]:ring-focus/[0.28]";

/** A button that stands in for a form field, such as a combobox trigger. */
export const FIELD_TRIGGER = `border-line-field bg-surface font-normal text-ink hover:border-line-field-hover focus-visible:border-focus focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] ${FIELD_OPEN} aria-[invalid=true]:border-bad aria-[invalid=true]:hover:border-bad disabled:border-line disabled:bg-sunken disabled:text-muted-foreground active:translate-y-0 transition-[border-color,box-shadow]`;

/** A selectable card, such as a radio drawn as a card, before it is selected. */
export const OPTION_CARD =
  "rounded-md border bg-surface text-ink transition-[border-color,background-color,box-shadow] duration-[120ms] ease-out motion-reduce:transition-none";

export const OPTION_CARD_IDLE = "border-line-field hover:border-line-field-hover hover:bg-hover";

/** Selected look of an option card: primary border, inner hairline, and a faint primary tint. */
export const OPTION_CARD_SELECTED =
  "border-primary bg-[color-mix(in_srgb,var(--primary-base)_5%,var(--surface))] shadow-[inset_0_0_0_1px_var(--primary-base)]";

/** Selected look for a card whose hidden Radix radio or checkbox reports `data-state=checked`. */
export const OPTION_CARD_SELECTED_WHEN_CHECKED =
  "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:hover:border-primary has-[[data-state=checked]]:bg-[color-mix(in_srgb,var(--primary-base)_5%,var(--surface))] has-[[data-state=checked]]:hover:bg-[color-mix(in_srgb,var(--primary-base)_5%,var(--surface))] has-[[data-state=checked]]:shadow-[inset_0_0_0_1px_var(--primary-base)]";

/** Focus look for a card that is itself the focusable element. */
export const OPTION_CARD_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Focus look for a card whose hidden radio or checkbox takes focus. */
export const OPTION_CARD_FOCUS_WITHIN =
  "has-[:focus-visible]:[outline-style:solid] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus";

/** Rest and hover border for the small checkable controls: checkbox, radio, switch. */
export const CHECKABLE_BORDER = "border-line-field hover:border-line-field-hover";

/** Fill and type of a field inside a dialog; the dialog surface is one step lighter than the page. */
export const DIALOG_CONTROL = "bg-popover text-body-sm";

/** Height and padding of a single-line field inside a dialog. */
export const DIALOG_INPUT_SIZE = "h-11 px-3.5";

/** Padding and resize behaviour of a multi-line field inside a dialog. */
export const DIALOG_TEXTAREA_SIZE = "resize-none px-3.5 py-2.5 leading-5";

/** Height and padding of a single-line field in a dense dialog row, as tall as a shared Input. */
export const COMPACT_INPUT_SIZE = "h-8 px-3";

const FIELD_INVALID =
  "border-bad hover:border-bad focus-visible:border-bad focus-visible:ring-bad/[0.24]";

const dialogField = (hasError: boolean) =>
  cn(
    FIELD_SURFACE,
    DIALOG_CONTROL,
    "w-full placeholder:text-muted-foreground",
    hasError && FIELD_INVALID,
  );

/** A raw single-line `<input>` in a dialog or form that is not built on the shared Input. */
export const getFieldInputClassName = (hasError: boolean, size: "dialog" | "compact" = "dialog") =>
  cn(dialogField(hasError), size === "compact" ? COMPACT_INPUT_SIZE : DIALOG_INPUT_SIZE);

/** A raw `<textarea>` in a dialog or form that is not built on the shared Textarea. */
export const getFieldTextareaClassName = (hasError: boolean) =>
  cn(dialogField(hasError), "block", DIALOG_TEXTAREA_SIZE);
