import {
  ATSDescription,
  ATSIcon,
  ATSLabel,
} from "@/features/actvity-selector";
import { ActivityNodeDataType } from "@/types";

interface ActivityToSelectProps {
  /** The activity data */
  data: ActivityNodeDataType;
}

/**
 * Renders a selectable activity (basically a node) component.
 *
 * @param {ActivityData} props.data - The data for the activity.
 */
export const ActivityToSelect = ({ data }: ActivityToSelectProps) => {
  return (
    <div className="group flex w-full items-center gap-3 px-2 py-1">
      {/* Acitity icon or image */}
      <ATSIcon iconSrc={data.icon} />

      <div className="grow">
        {/* Activity heading */}
        <ATSLabel label={data.label} />

        {/* Activity description */}
        <ATSDescription description={data.description} />
      </div>
    </div>
  );
};
