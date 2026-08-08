export interface ArtifactDto {
  platform: string;
  architecture: string;
  url: string;
  size: number | null;
  installerType: string | null;
  available: boolean;
  signatureUrl: string | null;
}

export interface ProductVersionDto {
  version: string;
  notes: string;
  artifacts: ArtifactDto[];
}

export interface ProductManifestDto {
  versions: ProductVersionDto[];
}

export interface DownloadManifestDto {
  desktop: ProductManifestDto;
  runner: ProductManifestDto;
}
