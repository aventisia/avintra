import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { folderZodSchema } from "../constants/folder-zod-schema.constant";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { isFolderNameTaken } from "../utils/agents-list-items.util";
import { findFolderColor, getFolderColor, getRandomFolderColor } from "../utils/folder-color.util";

type FolderFormValues = z.infer<typeof folderZodSchema>;

/**
 * Form for creating a folder, or editing the given one, with a live check for names already in use.
 * A new folder starts with a random color.
 */
export const useFolderForm = (folders: FoldersTableRowDto[], folder?: FoldersTableRowDto) => {
  const [initialColor] = useState(() => (folder ? getFolderColor(folder) : getRandomFolderColor()));
  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderZodSchema),
    mode: "onChange",
    defaultValues: {
      id: folder?.id ?? "",
      name: folder?.name ?? "",
      description: folder?.description ?? "",
      color: initialColor.key,
    },
  });

  const name = form.watch("name");
  const description = form.watch("description");
  const color = findFolderColor(form.watch("color")) ?? initialColor;
  const isNameTaken = isFolderNameTaken(name, folders, folder?.id);

  return { form, name, description, color, isNameTaken };
};
