import { NodeDataType } from "@/types/node-data-type";
import { TTSDescription } from "./TTSDescription";
import { TTSIcon } from "./TTSIcon";
import { TTSLabel } from "./TTSLabel";

interface TriggerToSelectProps {
  data: NodeDataType;
}

/**
 * Renders a selectable list item (a trigger node) component.
 */
export const TriggerToSelect = ({ data }: TriggerToSelectProps) => {
  return (
    <div className="group flex w-full items-center gap-3 px-2 py-1">
      {/* Trigger icon or image */}
      <TTSIcon iconSrc={data.icon} />

      <div className="grow">
        {/* Trigger heading */}
        <TTSLabel>{data.label}</TTSLabel>

        {/* Trigger description */}
        <TTSDescription>{data.description}</TTSDescription>
      </div>
    </div>
  );
};
