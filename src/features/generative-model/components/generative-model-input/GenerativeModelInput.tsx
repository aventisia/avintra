import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/select-field/Select";

import { ScrollArea } from "@aventisia/ui/scroll";

import { useDeleteInsertedFiles } from "../../hooks/useClearOutInsertedFiles";
import { useUpdateGenerativeModelForm } from "../../hooks/useUpdateGenerativeModelForm";
import { useSelectedTaskStore } from "../../store/selected-task-store";
import CompanyDeepDivesForm from "./company-deep-dives-form/CompanyDeepDivesForm";
import DocumentDraftingForm from "./document-drafting-form/DocmentDraftingForm";
import PersonaResearchForm from "./persona-research-form/PersonaResearchForm";
import RfpRpiResponseGeneratorForm from "./rfp-rpi-response-generator-form/RfpRpiResponseGeneratorForm";
import ThoughtLeadershipForm from "./thought-leadership-form/ThoughtLeadershipForm";

const GenerativeModelInput = () => {
  const { selectedTask, setSelectedTask } = useSelectedTaskStore();
  const { data: modelData, isLoading } = useFetchModel();
  const { isUpdatePending } = useUpdateGenerativeModelForm();
  const isSelectedTaskDisabled =
    isLoading || modelData?.data.setupStatus === "Completed" || isUpdatePending;
  const { data: fileList, refetch } = useFetchUploadedFiles("setup");
  const { removeInsertedDocument } = useDeleteInsertedFiles();

  const handleValueChange = (value: string) => {
    setSelectedTask(value);

    const documentPromises =
      fileList?.data.map((file) =>
        removeInsertedDocument({ id: file?.id ?? "" }),
      ) ?? [];

    Promise.all(documentPromises).finally(() => {
      refetch();
    });
  };

  return (
    <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <p className="text-base font-medium">Generative Model</p>
      </div>

      <ScrollArea className="mt-4 flex-grow">
        <div className="px-4 mt-2 mb-4">
          <p className="text-2xs px-1 py-1 font-medium">Select Task</p>
          <Select
            value={selectedTask}
            onValueChange={handleValueChange}
            disabled={isSelectedTaskDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="ThoughtLeadership">
                  Thought Leadership
                </SelectItem>
                <SelectItem value="CompanyDeepDive">
                  Company Deep Dives
                </SelectItem>
                <SelectItem value="PersonaResearch">
                  Persona Research
                </SelectItem>
                <SelectItem value="RFPResponseGenerator">
                  RFP / RPI Response Generator
                </SelectItem>
                <SelectItem value="DocumentDrafting">
                  Document Drafting
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedTask === "ThoughtLeadership" && <ThoughtLeadershipForm />}
        {selectedTask === "CompanyDeepDive" && <CompanyDeepDivesForm />}
        {selectedTask === "PersonaResearch" && <PersonaResearchForm />}
        {selectedTask === "RFPResponseGenerator" && (
          <RfpRpiResponseGeneratorForm />
        )}
        {selectedTask === "DocumentDrafting" && <DocumentDraftingForm />}
      </ScrollArea>
    </div>
  );
};

export default GenerativeModelInput;
