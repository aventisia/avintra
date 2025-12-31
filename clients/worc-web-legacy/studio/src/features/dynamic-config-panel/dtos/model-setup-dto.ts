/**
 * Represents a data transfer object (DTO) for an information model setup.
 */

export interface ModelSetupDto {
  type: string;
  summary?: string;
  categories?: {
    index: string;
    name: string;
    instructions: string;
  }[];
  questionAnswers?: {
    index: string;
    name: string;
    instructions: string;
  }[];
  fields?: {
    index: string;
    name: string;
    type: string;
    instructions: string;
  }[];
  tables?: unknown | null;
}
