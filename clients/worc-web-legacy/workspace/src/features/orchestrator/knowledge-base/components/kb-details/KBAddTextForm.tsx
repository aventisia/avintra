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
import FileUploadInfo from "./FileUploadInfo";

export const KBAddTextForm = () => {
  const { form } = useDefineKBAddTextForm();

  const onSubmit = (data: z.infer<typeof kbAddTextSchema>) => {
    console.log(" Payload:", data);
  };

  return (
    <ScrollArea className="h-[calc(85vh-4rem)] py-2">
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 pt-1"
      >
        {/* Query */}
        <TextareaField {...textContentProps} />

        {/* Number of chunks */}
        <div className="grid grid-cols-2 gap-2">
          <InputField {...chunkSizeProps} />

          <InputField {...chunkOverlapProps} />
        </div>
        <div className="bg-accent rounded-lg p-2">
          <p className="text-sm font-semibold">Text Processing Information</p>
          <ul className="text-xs ml-6 list-disc [&>li]:mt-2">
            <li>Text will be automatically chunked for optimal retrieval</li>
            <li>Formatting well be preserved where possible</li>
            <li>Very long texts will be split into manageable sections</li>
            <li>Headless Browser: Required for javascript-heavy sites</li>
            <li>The sources will be identified as 'Raw Text Input'</li>
          </ul>
        </div>
        <FileUploadInfo />
        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-4">
          {/* <Button
            size={"sm"}
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button> */}

          <Button size={"sm"} type="submit">
            Add Text
          </Button>
        </div>
      </Form>
    </ScrollArea>
  );
};
