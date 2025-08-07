import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ArrowLeftIcon, UserPlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useShareStore } from "../stores/share-store";
import { SearchMultiSelect } from "./share-access/ShareAccess";
import UserList from "./users/UserList";

const ShareAccessDialog = () => {
  const { open, setOpen, setView, view } = useShareStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      setView: state.setView,
      view: state.view,
    })),
  );

  // Get global store state & actions
  const { modelName } = useLabelDataStore();

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        setView("Users");
        setOpen(open);
      }}
    >
      <DialogContent className="h-[60vh]">
        <DialogDefaultHeader heading={`Share ${modelName}`} />
        <div className="h-[calc(60vh-5.1rem)] p-2">
          <div className="flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {view == "Search" ? (
                <Button
                  onClick={() => setView("Users")}
                  variant={"ghost"}
                  size={"icon6"}
                >
                  <ArrowLeftIcon />
                </Button>
              ) : null}
              <span>Share Access</span>
            </div>
            {view == "Users" ? (
              <Button
                onClick={() => setView("Search")}
                variant={"ghost"}
                size={"icon7"}
              >
                <UserPlusIcon />
              </Button>
            ) : null}
          </div>
          {view == "Users" ? <UserList /> : <SearchMultiSelect />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAccessDialog;
