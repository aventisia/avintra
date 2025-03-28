import { Upload } from 'lucide-react';
import React from 'react';

import { SimpleDDMenuItem } from '@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem';

interface UploadItemsRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const UploadItemsRowAction: React.FC<UploadItemsRowActionProps> = ({
  size = "md",
}) => {
  return <SimpleDDMenuItem size={size} content="Upload Items" Icon={Upload} />;
};
