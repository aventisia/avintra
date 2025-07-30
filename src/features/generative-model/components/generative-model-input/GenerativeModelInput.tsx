import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/select-field/Select";

import { ScrollArea } from "@aventisia/ui/scroll";

import { useSelectedTaskStore } from "../../store/selected-task-store";
import CompanyDeepDivesForm from "./company-deep-dives-form/CompanyDeepDivesForm";
import DocumentDraftingForm from "./document-drafting-form/DocmentDraftingForm";
import PersonaResearchForm from "./persona-research-form/PersonaResearchForm";
import RfpRpiResponseGeneratorForm from "./rfp-rpi-response-generator-form/RfpRpiResponseGeneratorForm";
import ThoughtLeadershipForm from "./thought-leadership-form/ThoughtLeadershipForm";

const GenerativeModelInput = () => {
  const { selectedTask, setSelectedTask } = useSelectedTaskStore();

  const handleValueChange = (value: string) => {
    setSelectedTask(value);
  };

  return (
    <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <p className="text-base font-medium">Generative Model</p>
      </div>

      <ScrollArea className="mt-4 flex-grow">
        <div className="px-4 mt-2 mb-4">
          <p className="text-2xs px-1 py-1 font-medium">Select Task</p>
          <Select value={selectedTask} onValueChange={handleValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="thought-leadership">
                  Thought Leadership
                </SelectItem>
                <SelectItem value="company-deep-dives">
                  Company Deep Dives
                </SelectItem>
                <SelectItem value="persona-research">
                  Persona Research
                </SelectItem>
                <SelectItem value="rfp-rpi-response-generator">
                  RFP / RPI Response Generator
                </SelectItem>
                <SelectItem value="document-drafting">
                  Document Drafting
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedTask === "thought-leadership" && <ThoughtLeadershipForm />}
        {selectedTask === "company-deep-dives" && <CompanyDeepDivesForm />}
        {selectedTask === "persona-research" && <PersonaResearchForm />}
        {selectedTask === "rfp-rpi-response-generator" && (
          <RfpRpiResponseGeneratorForm />
        )}
        {selectedTask === "document-drafting" && <DocumentDraftingForm />}
      </ScrollArea>
    </div>
  );
};

export default GenerativeModelInput;
