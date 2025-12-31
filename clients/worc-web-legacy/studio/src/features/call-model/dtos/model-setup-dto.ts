/**
 * Represents a data transfer object (DTO) for an information model setup.
 */

export interface ModelSetupDto {
  extraction?: {
    setupObject: {
      fields: {
        index: string;
        name: string;
        type: string;
        instructions: string;
      }[];
      tables: unknown[];
    };
  };
  classification?: {
    setupObject: {
      allowMultipleClasses: boolean;
      categories: {
        index: string;
        name: string;
        instructions: string;
        subCategories: unknown[];
      }[];
    };
  };
  summarization?: {
    setupObject: {
      totalMinimumWords: number;
      totalMaximumWords: number;
    };
  };
  sentimentAnalytics?: {
    setupObject: {
      categories: {
        index: string;
        name: string;
        instructions: string;
        subCategories: unknown[];
      }[];
    };
  };
  questionAnswer?: {
    setupObject: {
      questionAnswers: {
        index: string;
        name: string;
        instructions: string;
      }[];
    };
  };
}
