import { cn } from "@avplatform/ui/lib";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { UploadCloud } from "lucide-react";
import { type DropzoneOptions, useDropzone } from "react-dropzone";

export type FileUploadDropzoneProps = DropzoneOptions & {
  description?: string;
};
export const FileUploadDropzone = ({ description, ...props }: FileUploadDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles } =
    useDropzone({
      ...props,
    });

  return (
    <div>
      <div className="flex w-full flex-col" {...getRootProps()}>
        <label
          htmlFor="dropzone-file"
          className={cn(
            "flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg",
            "border-[1.5px] border-dashed border-line-strong bg-sunken transition-colors duration-[120ms] ease-out hover:bg-hover",
            isDragActive && "border-indicator bg-selected",
            isDragAccept && "border-ok bg-ok/10",
            isDragReject && "border-bad bg-bad/10",
          )}
        >
          <div className="flex flex-col items-center justify-center pb-2 pt-5">
            {isDragReject ? <p className="text-bad">This file type not allowed</p> : null}
            <UploadCloud
              className={cn("h-10 w-10 text-muted-foreground", isDragReject && "text-bad")}
            />
            <p className="mb-2 text-body-sm text-muted-foreground">
              <span className="font-semibold text-ink">Click to upload</span> or drag and drop
            </p>
            <p className="text-hint text-muted-foreground">{description}</p>
          </div>
          <input {...getInputProps()} />
        </label>
      </div>

      {acceptedFiles && (
        <div className="mt-2">
          <p className="my-1 text-sm">Uploaded files</p>
          <ul>
            {acceptedFiles?.map((file, i) => (
              <li key={file.name}>
                <section className="flex items-center justify-start rounded-md border border-line bg-surface p-2 text-body-sm">
                  <span className="me-2 p-2">{i + 1}.</span>
                  {"  "}
                  <span>
                    <p className="text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.relativePath}</p>
                  </span>
                  <span className="group ms-auto flex items-center gap-4">
                    <p className="font-mono text-hint tabular-nums text-muted-foreground">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                    <CrossCircledIcon className="h-5 w-5 text-bad hover:cursor-pointer" />
                  </span>
                </section>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
