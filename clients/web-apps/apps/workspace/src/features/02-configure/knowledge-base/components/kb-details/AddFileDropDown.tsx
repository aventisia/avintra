import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { SplitButton } from "@avplatform/ui/buttons";
import { DropdownMenuContent, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { FileTextIcon, TextTIcon } from "@phosphor-icons/react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";

export default function AddFileDropDown() {
  // Adding KB files/text creates sub-resources, which is disabled in Prod.
  const { locked } = useActionLock();

  const { setShowDialog, setType } = useKBFilesDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setType: state.setType,
    })),
  );

  // Handle create action
  const handleAddFile = () => {
    setShowDialog(true);
    setType("file");
  };

  // Register the Ctrl+Alt+N shortcut (suppressed when the environment is locked).
  useHotkeys("ctrl+alt+n", handleAddFile, { preventDefault: true, enabled: !locked });

  return (
    <LockedActionTooltip>
      <SplitButton
        size="xs"
        onClick={handleAddFile}
        disabled={locked}
        shortcut={locked ? undefined : "Ctrl+Alt+N"}
        menuLabel="More add options"
        menu={
          <DropdownMenuContent className="w-40 min-w-40" align="end">
            <SimpleDDMenuItem
              size="md"
              disabled={locked}
              onClick={handleAddFile}
              Icon={FileTextIcon}
              content="Add file"
            />
            <SimpleDDMenuItem
              size="md"
              disabled={locked}
              onClick={() => {
                setShowDialog(true);
                setType("text");
              }}
              Icon={TextTIcon}
              content="Add text"
            />
          </DropdownMenuContent>
        }
      >
        <FileTextIcon className="h-3.5 w-3.5" />
        Add file
      </SplitButton>
    </LockedActionTooltip>
  );
}
