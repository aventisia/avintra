import { DropdownMenu, DropdownMenuContent } from "@avplatform/ui/dropdown-menu";

import { ActionsTrigger } from "./ActionsTrigger";
import CloneToAgentAction from "./CloneToAgentAction";
import CloneToVersionAction from "./CloneToVersionAction";
import ExportAction from "./ExportAction";
import OpenAction from "./OpenAction";
import RestoreAction from "./RestoreAction";

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
