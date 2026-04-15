import { FileUploader } from "..";

{
  /**
   * Use this approach when you want the uploader to handle everything,
   * including showing its own "Upload" and "Cancel" buttons.
   * Perfect for Dialogs or dedicated asset-management pages.
   */
}
export default function BasicExample() {
  return (
    <div className="h-[500px] border rounded-lg">
      <FileUploader
        isPublic={false}
        maxSize={10 * 1024 * 1024} // 10MB
        acceptedTypes={{
          "application/pdf": [".pdf"],
          "image/jpeg": [".jpg", ".jpeg"],
        }}
        disclaimer={<p>Files must be under 10MB.</p>}
        onCancel={() => console.log("User clicked cancel")}
        onUploadSuccess={(uploadedFiles) => {
          console.log("Successfully uploaded to S3:", uploadedFiles);
        }}
      />
    </div>
  );
}
