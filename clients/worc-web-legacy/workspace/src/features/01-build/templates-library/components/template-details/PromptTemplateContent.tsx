import { useEffect, useState } from "react";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { PromptTemplateSchema } from "../../types/prompt-template-schema-type";

export function PromptTemplateContent({
  template,
}: {
  template: UseTemplateDTO;
}) {
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    try {
      const parsedSchema = JSON.parse(
        template.schema ?? "{}",
      ) as PromptTemplateSchema;

      setPrompt(parsedSchema.prompt ?? "");
      setDescription(template.description ?? "");
    } catch {
      setPrompt("");
      setDescription("");
    }
  }, [template]);

  return (
    <div>
      {description && (
        <p className="text-md border-b pb-3 mb-3.5">{description}</p>
      )}

      <div className=" overflow-auto  text-md font-medium leading-5 whitespace-pre-wrap">
        <p className="font-semibold pb-3">Prompt: </p>
        <p>{prompt}</p>
      </div>
    </div>
  );
}
