import { NodeDataType } from "@/types/NodeDataType";
import { NTSDescription } from "./NTSDescription";
import { NTSIcon } from "./NTSIcon";
import { NTSLabel } from "./NTSLabel";

interface NodeToSelectProps {
  data: NodeDataType;
}

/**
 * Renders a selectable list item (a node) component.
 */
export const NodeToSelect = ({ data }: NodeToSelectProps) => {
  return (
    <div className="group flex w-full items-center gap-3 px-2 py-1">
      {/* Node icon or image */}
      <NTSIcon iconSrc={data.icon} />

      <div className="grow">
        {/* Node heading */}
        <NTSLabel>{data.label}</NTSLabel>

        {/* Node description */}
        <NTSDescription>{data.description}</NTSDescription>
      </div>
    </div>
  );
};
