import { UploadCloud } from "lucide-react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

import { cn } from "@aventisia/ui/lib";
import { CrossCircledIcon } from "@radix-ui/react-icons";

export type FileUploadDropzoneProps = DropzoneOptions & {
  description?: string;
};
export const FileUploadDropzone = ({
  description,
  ...props
}: FileUploadDropzoneProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    ...props,
  });

  return (
    <div>
      <div className="flex w-full flex-col   " {...getRootProps()}>
        <label
          htmlFor="dropzone-file"
          className={cn(
            "dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer",
            " flex-col items-center justify-center rounded-lg border-2 border-dashed",
            " border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600",
            " dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600",
            isDragActive && "bg-primary-50",
            isDragAccept && "bg-green-50",
            isDragReject && "bg-red-50",
          )}
        >
          <div className="flex flex-col items-center justify-center pb-2 pt-5">
            {isDragReject ? (
              <p className="text-destructive">This file type not allowed</p>
            ) : null}
            <UploadCloud
              className={cn(
                "h-10 w-10 text-muted-foreground",
                isDragReject && "stroke-destructive",
              )}
            />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
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
                <section className="flex justify-start items-center border rounded-lg shadow-sm p-2">
                  <span className="p-2    me-2">{i + 1}.</span>
                  {"  "}
                  <span>
                    <p className=" text-sm">{file.name}</p>
                    <p className="  text-muted-foreground text-xs">
                      {file.relativePath}
                    </p>
                  </span>
                  <span className="ms-auto group flex gap-4 items-center">
                    <p>({(file.size / 1024).toFixed(2)} KB)</p>
                    <CrossCircledIcon className="w-5 h-5 stroke-destructive hover:cursor-pointer" />
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
