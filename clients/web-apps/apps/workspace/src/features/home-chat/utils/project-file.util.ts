import {
  PROJECT_FILE_EXTENSIONS,
  PROJECT_FILE_NAME_MAX_LENGTH,
  PROJECT_MAX_FILES,
  PROJECT_MAX_FILE_BYTES,
  PROJECT_MAX_TOTAL_BYTES,
} from "../constants/project-file.constant";

/** Returns a plain message when the file cannot be added to the project, otherwise null. */
export const checkProjectFile = (
  file: { name: string; size: number },
  existing: readonly { sizeBytes: number }[],
): string | null => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(PROJECT_FILE_EXTENSIONS as readonly string[]).includes(extension))
    return `Only text files are supported (${PROJECT_FILE_EXTENSIONS.join(", ")}).`;
  if (file.name.length > PROJECT_FILE_NAME_MAX_LENGTH) return "That file name is too long.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > PROJECT_MAX_FILE_BYTES) return "That file is over the 50 KB limit.";
  if (existing.length >= PROJECT_MAX_FILES)
    return `A project can hold up to ${PROJECT_MAX_FILES} files. Remove one to add another.`;
  const used = existing.reduce((sum, item) => sum + item.sizeBytes, 0);
  if (used + file.size > PROJECT_MAX_TOTAL_BYTES)
    return "Project files can total up to 100 KB. Remove a file to add this one.";
  return null;
};

export const readProjectFileText = async (file: Blob): Promise<string> => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new Error("The file is not valid UTF-8 text.");
  }
};
