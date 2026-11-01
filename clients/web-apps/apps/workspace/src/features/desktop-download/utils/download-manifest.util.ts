import type { ArtifactDto, ProductManifestDto } from "../dtos/download-manifest.dto";
import type { Platform } from "./detect-platform.util";

type LatestArtifact = { artifact: ArtifactDto; version: string };

export const getLatestArtifact = (
  product: ProductManifestDto | undefined,
  platform: Platform,
): LatestArtifact | null => {
  const isWanted = (artifact: ArtifactDto) => artifact.platform === platform && artifact.available;
  const version = product?.versions.find((candidate) => candidate.artifacts.some(isWanted));
  const artifact = version?.artifacts.find(isWanted);
  return version && artifact ? { artifact, version: version.version } : null;
};

const formatSize = (bytes: number | null) =>
  bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : "";

/** "v0.1.83 · 184.0 MB · 64-bit", leaving out whatever the manifest does not know. */
export const describeArtifact = ({ artifact, version }: LatestArtifact) =>
  [
    `v${version}`,
    formatSize(artifact.size),
    artifact.architecture === "x86_64" ? "64-bit" : artifact.architecture,
  ]
    .filter(Boolean)
    .join(" · ");
