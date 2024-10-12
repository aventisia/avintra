import { nodesIconMapper } from "@/components/node-icons/NodesIconMapper";
import { NodeDataType } from "@/types/node-data-type";
import { NTSDescription } from "./NTSDescription";
import { NTSImage } from "./NTSImage";
import { NTSLabel } from "./NTSLabel";
import { Badge } from "@/react-toolkit/ui/badge";

interface NodeToSelectProps {
  data: NodeDataType;
}

/**
 * Renders a selectable list item (a node) component.
 */
export const NodeToSelect = ({ data }: NodeToSelectProps) => {
  return (
    <div className="flex w-full items-start gap-3 px-2 py-1">
      {/* Node icon or image */}
      {data.icon ? (
        <div className="mt-1.5">{nodesIconMapper[data.icon]}</div>
      ) : (
        <NTSImage src={data.img} />
      )}

      <div className="grow space-y-0.5">
        {/* Node heading */}
        <div className="flex gap-2">
          <NTSLabel>{data.label}</NTSLabel>
          <Badge className="text-3xs py-0 px-2" variant={"outline"}>{data.category}</Badge>
        </div>

        {/* Node description */}
        <NTSDescription>{data.description}</NTSDescription>
      </div>
    </div>
  );
};
