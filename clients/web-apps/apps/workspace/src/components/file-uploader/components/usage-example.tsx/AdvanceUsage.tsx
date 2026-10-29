/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@avplatform/ui/buttons";
import { useRef } from "react";

import { FileUploader, FileUploaderRef } from "..";

{
  /**
   * Use this approach when the uploader is part of a larger form.
   * You can hide the uploader's internal buttons (hideFooter={true}) and
   * trigger the upload externally using a ref when the user submits your main form.
   */
}
export function FormExample() {
  const uploaderRef = useRef<FileUploaderRef>(null);

  const onSubmitForm = async (e: any) => {
    e.preventDefault();

    // 1. Check if user selected any files
    if (uploaderRef.current?.hasStagedFiles) {
      try {
        // 2. Trigger the upload externally
        const uploadedFiles = await uploaderRef.current.uploadStagedFiles();
        console.log("Attach these DTOs to the form data:", uploadedFiles);
      } catch (err) {
        console.error("Upload failed, halt form submission", err);
        return;
      }
    }

    // 3. Submit the rest of your form...
  };

  return (
    <form onSubmit={onSubmitForm}>
      <input type="text" placeholder="Document title" />

      <div className="h-[400px]">
        <FileUploader
          ref={uploaderRef}
          hideFooter={true} // Hides internal buttons
        />
      </div>

      <Button type="submit">Submit form & upload files</Button>
    </form>
  );
}
