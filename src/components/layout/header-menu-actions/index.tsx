import { useApiKeyDialogStore } from "@/features/api-keys/store/api-key-dialog-store";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { usePublishModelMutation } from "@/features/publish-model/hooks/usePublishModel";
import { usePublishDialogStore } from "@/features/publish-model/stores/usePublishDialogStore";
import { useSaveAsTemplateDialogStore } from "@/features/save-as-template/store/useSaveAsTemplateDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { KeyRound, LayoutTemplate, Send } from "lucide-react";

import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";

const HeaderMenuActions = () => {
  const { setOpen } = usePublishDialogStore();
  const { setOpen: setOpenSaveAsTemplateDialog } =
    useSaveAsTemplateDialogStore();
  const { setOpen: setApiKeyDialogStore } = useApiKeyDialogStore();
  const { data: modelData, isLoading } = useFetchModel();
  const { isPending } = usePublishModelMutation();
  const isPublishButtonDisabled =
    isPending ||
    isLoading ||
    modelData?.data?.isPublished ||
    modelData?.data?.setupStatus === "Pending";
  const isSaveAsTemplateButtonDisabled =
    isPending || isLoading || modelData?.data?.setupStatus === "Pending";

  return (
    <DropdownMenu>
      {/* Header actions trigger */}
      <HeaderActionMenuTrigger />

      {/* Header actions menu content */}
      <DropdownMenuContent
        align="end"
        className="mt-0 w-[13rem] min-w-[13rem] mlg:mt-4"
      >
        <SimpleDDMenuItem
          size="md"
          Icon={Send}
          content="Publish Model"
          onClick={() => {
            setOpen(true);
          }}
          disabled={isPublishButtonDisabled}
        />
        <SimpleDDMenuItem
          size="md"
          Icon={LayoutTemplate}
          content="Save as Template"
          onClick={() => {
            setOpenSaveAsTemplateDialog(true);
          }}
          disabled={isSaveAsTemplateButtonDisabled}
        />
        {/* <FlowLogHeader /> */}
        <SimpleDDMenuItem
          size="md"
          Icon={KeyRound}
          content="API Keys"
          onClick={() => {
            setApiKeyDialogStore(true);
          }}
          disabled={!modelData?.data.isPublished}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderMenuActions;
