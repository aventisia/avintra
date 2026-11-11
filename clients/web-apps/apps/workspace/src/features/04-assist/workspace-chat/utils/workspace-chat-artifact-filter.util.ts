import type { ChatArtifactDto } from "../dtos/chat-artifact.dto";

export const ARTIFACT_KIND_LABELS = {
  all: "All types",
  page: "Pages",
  image: "Images",
  table: "Tables",
  document: "Documents",
} as const;
export type ArtifactKind = keyof typeof ARTIFACT_KIND_LABELS;

export const ARTIFACT_SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name",
  largest: "Largest first",
} as const;
export type ArtifactSort = keyof typeof ARTIFACT_SORT_LABELS;

const KIND_EXTENSIONS: Record<Exclude<ArtifactKind, "all">, string[]> = {
  page: ["html", "htm"],
  image: ["svg", "png", "jpg", "jpeg", "gif", "webp"],
  table: ["csv", "tsv", "xlsx", "xls"],
  document: ["md", "txt", "pdf", "doc", "docx"],
};

const COMPARERS: Record<ArtifactSort, (a: ChatArtifactDto, b: ChatArtifactDto) => number> = {
  newest: (a, b) => Date.parse(b.createdOn) - Date.parse(a.createdOn),
  oldest: (a, b) => Date.parse(a.createdOn) - Date.parse(b.createdOn),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  largest: (a, b) => b.sizeBytes - a.sizeBytes,
};

const extensionOf = (name: string) => /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase() ?? "";

/** Artifacts whose name or chat title matches the search, of the chosen kind, in the chosen order. */
export const filterArtifacts = (
  artifacts: ChatArtifactDto[],
  { search, kind, sort }: { search: string; kind: ArtifactKind; sort: ArtifactSort },
) => {
  const query = search.trim().toLowerCase();
  return artifacts
    .filter(
      (artifact) =>
        (kind === "all" || KIND_EXTENSIONS[kind].includes(extensionOf(artifact.name))) &&
        (!query ||
          artifact.name.toLowerCase().includes(query) ||
          Boolean(artifact.conversationTitle?.toLowerCase().includes(query))),
    )
    .sort(COMPARERS[sort]);
};
