import { ZapIcon } from 'lucide-react';
import React from 'react';

import { SimpleDDMenuItem } from '@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem';

interface AddTriggerRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AddTriggerRowAction: React.FC<AddTriggerRowActionProps> = ({
  size = "md",
}) => {
  return <SimpleDDMenuItem size={size} content="Add Trigger" Icon={ZapIcon} />;
};
