import { FlowsTableDto } from "@/features/flows-popover";

interface FlowNameProps {
  flowData: FlowsTableDto;
}

/**
 * Renders the FlowName component.
 */
export const FLIName: React.FC<FlowNameProps> = ({ flowData: { name } }) => {
  return (
    <div className="flex max-w-48">
      <span className="truncate font-medium text-xs leading-5">{name}</span>
    </div>
  );
};
