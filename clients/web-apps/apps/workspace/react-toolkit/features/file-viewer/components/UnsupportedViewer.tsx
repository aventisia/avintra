import { EmptyState } from "@avplatform/ui";
import { FileXIcon } from "@phosphor-icons/react";

interface UnsupportedViewerProps {
  /** The file extension (without leading dot) for a tailored message */
  extension?: string;
}

const UnsupportedViewer = ({ extension }: UnsupportedViewerProps) => {
  const formatLabel = extension ? `.${extension.toLowerCase()}` : "this";

  return (
    <EmptyState
      primaryMessage={`Preview not available for ${formatLabel} format`}
      // secondaryMessage="Preview is not supported for this format."
      Icon={FileXIcon}
    />
  );
};

export default UnsupportedViewer;
