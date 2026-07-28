import { DropdownMenu, DropdownMenuContent } from "@avplatform/ui/dropdown-menu";

import OpenAction from "./OpenAction";
import ExportAction from "./ExportAction";
import RestoreAction from "./RestoreAction";
import { ActionsTrigger } from "./ActionsTrigger";
import CloneToVersionAction from "./CloneToVersionAction";
import CloneToAgentAction from "./CloneToAgentAction";

interface Props {
  id: string;
}

export default function VersionHistoryActions({ id }: Props) {
  return (
    <DropdownMenu>
      <ActionsTrigger />

      <DropdownMenuContent align="end" className="min-w-40">
        <OpenAction id={id} />
        <CloneToVersionAction id={id} />
        <CloneToAgentAction id={id} />
        <ExportAction id={id} />
        <RestoreAction id={id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
