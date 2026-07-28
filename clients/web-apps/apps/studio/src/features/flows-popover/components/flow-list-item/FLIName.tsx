import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";

interface FlowNameProps {
  flowData: FlowsTableDto;
}

/**
 * Renders the FlowName component.
 */
export const FLIName: React.FC<FlowNameProps> = ({ flowData: { name } }) => {
  return (
    <div className="flex max-w-48">
      <span className="truncate text-xs font-medium leading-5">{name}</span>
    </div>
  );
};
