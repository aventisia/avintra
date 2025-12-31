// Level 3
export interface ISubSubCategoryDescriptor {
  id?: string;
  name: string;
  value: string;
  confidenceScore?: string;
}

// Level 2
export interface ISubCategoryDescriptor {
  id?: string;
  name: string;
  value: string;
  confidenceScore?: string;
  subSubCategories?: ISubSubCategoryDescriptor[] | null; // optional, can default to []
}

// Level 1
export interface SentimentAnalyticsTestDTO {
  id?: string;
  name: string;
  value: string;
  confidenceScore?: string;
  subCategories?: ISubCategoryDescriptor[] | null; // optional, can default to []
}
