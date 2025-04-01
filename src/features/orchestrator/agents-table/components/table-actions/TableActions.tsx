import { DataTableRowActions } from '@/react-toolkit/ui/data-table/row-actions/DataTableRowActions';
import { DTRowAction } from '@/react-toolkit/ui/data-table/row-actions/DTRowAction';
import { Separator } from '@/react-toolkit/ui/separator';

import { AgentRowDeleteAction } from './AgentRowDeleteAction';
import { AssignMachineRowAction } from './AssignMachineRowAction';

type TableActionsProps = {
  rowId: string;
};
export const TableActions = ({ rowId }: TableActionsProps) => {
  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" />
      <AssignMachineRowAction rowId={rowId} />
      <Separator />
      <AgentRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
