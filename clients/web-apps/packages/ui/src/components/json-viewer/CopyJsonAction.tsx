import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { CopyButton } from "../buttons/CopyButton";

/** Props for the shared header copy action. */
type CopyJsonActionProps = {
  /** JSON string to copy when the button is clicked. */
  json: string;
};

/**
 * A compact header button that copies the provided JSON payload.
 *
 * Use this inside the `action` slot of a card/section header so consumers
 * can copy full JSON without relying on the per-row copy icons inside the
 * JsonViewer body.
 */
export const CopyJsonAction = ({ json }: CopyJsonActionProps) => {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <CopyButton
      isCopied={isCopied}
      showTooltip
      aria-label={isCopied ? "Copied" : "Copy JSON"}
      onClick={() => void copy(json)}
      className="text-muted-foreground/60 size-6 hover:text-primary-text opacity-60 hover:opacity-100"
      iconClassName="size-3.5"
    />
  );
};
