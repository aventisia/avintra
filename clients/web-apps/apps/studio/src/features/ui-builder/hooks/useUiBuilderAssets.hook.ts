import { toast } from "@avplatform/ui/sonner";
import { toUiBuilderAssetMap } from "@avplatform/ui/ui-builder-host";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  createUiBuilderAsset,
  deleteUiBuilderAsset,
  getUiBuilderAssetContents,
} from "../apis/ui-builder.apis";

const UI_BUILDER_ASSETS_QUERY_KEY = ["ui-builder-assets"] as const;

const readAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
    reader.readAsDataURL(file);
  });

/** Derives a code-friendly asset name from a file name, for example "Company Logo.png" → "companyLogo". */
export const toUiBuilderAssetName = (fileName: string) => {
  const words = fileName
    .replace(/\.[^.]+$/, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const name = words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
  return (/^[A-Za-z]/.test(name) ? name : `image${name}`).slice(0, 64) || "image";
};

/** State returned by {@link useUiBuilderAssets}. */
export type UiBuilderAssetsState = ReturnType<typeof useUiBuilderAssets>;

/**
 * Loads a project's uploaded images with their content and exposes upload and delete.
 */
export const useUiBuilderAssets = (projectId: string) => {
  const queryClient = useQueryClient();
  const queryKey = [...UI_BUILDER_ASSETS_QUERY_KEY, projectId];

  const assetsQuery = useQuery({
    queryKey,
    queryFn: () => getUiBuilderAssetContents(projectId),
    enabled: Boolean(projectId),
    staleTime: 5 * 60_000,
  });

  const assets = useMemo(() => assetsQuery.data?.data ?? [], [assetsQuery.data]);
  const assetMap = useMemo(() => toUiBuilderAssetMap(assets), [assets]);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) =>
      createUiBuilderAsset(projectId, {
        name,
        contentType: file.type,
        dataBase64: await readAsBase64(file),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
    onError: (error) => toast.error(`The image could not be uploaded. ${String(error)}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => deleteUiBuilderAsset(projectId, assetId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
    onError: (error) => toast.error(`The image could not be deleted. ${String(error)}`),
  });

  return { assets, assetMap, assetsQuery, uploadMutation, deleteMutation };
};
