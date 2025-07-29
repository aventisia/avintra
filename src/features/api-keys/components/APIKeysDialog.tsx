import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { Input, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { Label } from "@aventisia/ui/label";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { Copy, Plus, SquarePen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDeleteAPIKey } from "../hooks/useDeleteAPIKey";
import { useFetchApiKeys } from "../hooks/useFetchAPIKeys";
import { useApiKeyDialogStore } from "../store/api-key-dialog-store";
import { useCreateNewApiKeyDialogStore } from "../store/create-new-api-key-dialog-store";
import { useUpdateApiKeyDialogStore } from "../store/update-api-key-dialog-store";
import { APIKeysActionMenuTrigger } from "./HeaderActionMenuTrigger";
import CreateAPIKeyDialog from "./create-api-key/CreateAPIKeyDialog";
import UpdateAPIKeyDialog from "./update-api-key/UpdateAPIKeyDialog";

const APIKeysDialog = () => {
  const { isOpen, setOpen } = useApiKeyDialogStore();
  const { setOpen: setUpdateApiKeyDialogOpen, setUpdateFields } =
    useUpdateApiKeyDialogStore();
  const { setOpen: setCreateNewApiKeyOpen } = useCreateNewApiKeyDialogStore();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { data, isLoading } = useFetchApiKeys();
  const { mutate: deleteKey } = useDeleteAPIKey();

  const openUpdateApiKeyDialog = (id: string, apiKeyName: string) => {
    setUpdateApiKeyDialogOpen(true);
    setUpdateFields(id, apiKeyName);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent side={"right"} className="!max-w-[35vw]">
          <DialogDefaultHeader
            className="px-3.5 py-3 text-lg tracking-wide"
            heading="API Keys"
          />
          <ScrollArea className="h-[calc(100vh-3.56rem)]">
            <div className="px-4 py-4 space-y-5">
              <div className="space-y-1 ">
                <Label htmlFor="api-url" className="ml-1">
                  API URL
                </Label>
                <div className="relative">
                  <Input
                    name="api-url"
                    className="py-6 pr-32 truncate text-muted-foreground"
                    value={`${import.meta.env.VITE_AISTUDIO_API_URL}/v1/model/${modelId}`}
                    disabled={true}
                  />
                  <Button
                    variant={"ghost"}
                    className="flex gap-1.5 bg-[#F3F2FF] text-primary absolute right-2 top-1"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${import.meta.env.VITE_AISTUDIO_API_URL}/model/${modelId}`,
                      );
                      toast.success("API URL Copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {!isLoading &&
                  data?.data.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="border px-4 py-3 rounded-lg flex justify-between items-center"
                      >
                        <p className="text-md">{item.name}</p>
                        <DropdownMenu>
                          {/* Header actions trigger */}
                          <APIKeysActionMenuTrigger />

                          {/* Header actions menu content */}
                          <DropdownMenuContent
                            align="end"
                            className="mt-0 w-[10rem] min-w-[10rem] "
                          >
                            <SimpleDDMenuItem
                              size="md"
                              Icon={SquarePen}
                              content="Edit"
                              onClick={() => {
                                openUpdateApiKeyDialog(
                                  item.id || "",
                                  item.name,
                                );
                              }}
                            />

                            {/* <FlowLogHeader /> */}
                            <DeleteDDMenuItem
                              size="md"
                              content="Delete"
                              onClick={() => {
                                showDefaultAlertDialog({
                                  confirmActionFn: () => {
                                    deleteKey(item?.id || "");
                                  },
                                  alertType: "delete-record",
                                  additionalText: "API Key",
                                });
                              }}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                <Button
                  className="w-full bg-[#F3F2FF] text-primary border-none flex items-center gap-1 !mt-5"
                  onClick={() => setCreateNewApiKeyOpen(true)}
                >
                  <Plus className="h-5 w-5" /> Create API Key
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <CreateAPIKeyDialog />
      <UpdateAPIKeyDialog />
    </>
  );
};

export default APIKeysDialog;
