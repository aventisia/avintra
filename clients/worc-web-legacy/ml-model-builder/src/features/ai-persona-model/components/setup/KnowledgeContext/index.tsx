import { contextMemoryProps } from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";

import { InputField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import DocumentsTable from "./DocumentsTable";

type KnowledgeContextProps = {
  form: UseFormReturn<z.infer<typeof aiPersonaSetupFormZodSchema>>;
  categoryFields: { id: string }[];
  addCategory: () => void;
  removeCategory: (id: string, index: number) => void;
};

const KnowledgeContext = ({
  form,
  categoryFields,
  addCategory,
  removeCategory,
}: KnowledgeContextProps) => {
  return (
    <div className="space-y-4">
      <p className="text-base">Knowledge & Context</p>
      <DocumentsTable
        addCategory={addCategory}
        form={form}
        removeCategory={removeCategory}
        categoryFields={categoryFields}
      />
      <InputField {...contextMemoryProps} />
    </div>
  );
};

export default KnowledgeContext;
