export type VoiceCatalogCapability = "tts" | "realtime";

export interface VoiceInfoDto {
  id: string;
  name: string;
  sample: string | null;
}

export interface LanguageInfoDto {
  id: string;
  name: string;
}

export interface VoicesResponseDto {
  provider: string;
  model: string;
  capability: VoiceCatalogCapability;
  voices: VoiceInfoDto[];
  count: number;
}

export interface LanguagesResponseDto {
  provider: string;
  model: string;
  capability: VoiceCatalogCapability;
  languages: LanguageInfoDto[];
  count: number;
}

export interface VoiceCatalogQueryDto {
  provider: string;
  model: string;
  capability: VoiceCatalogCapability;
  credential_name?: string;
}
