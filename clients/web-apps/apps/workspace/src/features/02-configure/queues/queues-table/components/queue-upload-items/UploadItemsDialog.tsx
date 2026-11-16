import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";
import { UploadItemsForm } from "./upload-items-form/UploadItemsForm";

const UploadItemsDialog = () => {
  const showDialog = useQueueUploadItemsStore((state) => state.showDialog);

  return showDialog ? <UploadItemsForm /> : null;
};

export default UploadItemsDialog;
