import { Button } from "@aventisia/ui/buttons";
import { Form, InputField, TextareaField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { z } from "zod";

import {
  chunkOverlapProps,
  chunkSizeProps,
  textContentProps,
} from "../../constants/kb-add-text-feild-props";
import { kbAddTextSchema } from "../../constants/kb-add-text-zod-schema";
import { useDefineKBAddTextForm } from "../../hooks/useDefineKBAddTextForm";
import FileUploadDisclaimer from "./FileUploadDisclaimer";

export const KBAddTextForm = () => {
  const { form } = useDefineKBAddTextForm();

  const generateFileNameFromText = (text: string, wordLimit = 5) => {
    if (!text) return "untitled.txt";

    const words = text.trim().split(/\s+/).slice(0, wordLimit).join(" ");

    return (
      words
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove special chars
        .replace(/\s+/g, "-") + ".txt"
    );
  };

  const onSubmit = (data: z.infer<typeof kbAddTextSchema>) => {
    const fileName = generateFileNameFromText(data.textContent, 5);
    console.log(" Payload:", { ...data, fileName });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-0 p-0 "
    >
      <div className="flex flex-col justify-between">
        <ScrollArea className="h-[calc(85vh-7.5rem)] p-4 pt-3 ">
          <div className="space-y-4">
            {/* Query */}
            <TextareaField {...textContentProps} />

            {/* Number of chunks */}
            <div className="grid grid-cols-2 gap-2">
              <InputField {...chunkSizeProps} />

              <InputField {...chunkOverlapProps} />
            </div>

            <FileUploadDisclaimer />
          </div>
        </ScrollArea>

        <div className="flex h-16 border-t px-4 justify-end items-center">
          <Button size={"sm"} type="submit">
            Add Text
          </Button>
        </div>
      </div>
    </Form>
  );
};
