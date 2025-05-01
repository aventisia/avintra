import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import SavingIndicator from "./SavingIndicator";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import InformationExtractorForm from "./InformationExtractorForm";

const InformationExtractor = () => {
  // Get store state and actions
  const { isDataSaving } = useAnnotationDataStore(
    useShallow((state) => ({
      isDataSaving: state.isDataSaving,
    })),
  );

  return (
    <div className="col-span-1 ml-2 rounded-lg bg-white shadow">
      <div className="flex h-12 items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-md font-medium">Extraction</p>
          <SavingIndicator isSaving={isDataSaving} />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-7.6rem)] py-2">
        <InformationExtractorForm />
      </ScrollArea>
    </div>
  );
};

export default InformationExtractor;
