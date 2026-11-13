import type { ChatArtifactDto } from "../dtos/chat-artifact.dto";

export const ARTIFACT_KIND_LABELS = {
  all: "All types",
  page: "Pages",
  image: "Images",
  table: "Tables",
  document: "Documents",
  presentation: "Presentations",
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
  presentation: ["ppt", "pptx"],
};

const COMPARERS: Record<ArtifactSort, (a: ChatArtifactDto, b: ChatArtifactDto) => number> = {
  newest: (a, b) => Date.parse(b.createdOn) - Date.parse(a.createdOn),
  oldest: (a, b) => Date.parse(a.createdOn) - Date.parse(b.createdOn),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  largest: (a, b) => b.sizeBytes - a.sizeBytes,
};

const extensionOf = (name: string) => /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase() ?? "";

/** One row per file name in a conversation: the latest version only, so history stays behind the preview switcher. */
export const latestArtifacts = (artifacts: ChatArtifactDto[]) => {
  const byFile = new Map<string, ChatArtifactDto>();
  for (const artifact of artifacts) {
    const key = `${artifact.conversationId}␟${artifact.name.toLowerCase()}`;
    const current = byFile.get(key);
    if (
      !current ||
      artifact.versionNumber > current.versionNumber ||
      (artifact.versionNumber === current.versionNumber &&
        Date.parse(artifact.createdOn) > Date.parse(current.createdOn))
    )
      byFile.set(key, artifact);
  }
  return [...byFile.values()];
};

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
