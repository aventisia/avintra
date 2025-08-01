// Level 3
export interface ISubSubCategoryDescriptor {
    id?: string;
    name: string;
    value: string;
}
  
// Level 2
  export interface ISubCategoryDescriptor {
    id?: string;
    name: string;
    value: string;
    subSubCategories?: ISubSubCategoryDescriptor[] | null; // optional, can default to []
}

// Level 1
interface SentimentAnalyticsCategoryDescriptor {
    id?: string
    name: string;
    value: string;
    subCategories?: ISubCategoryDescriptor[] | null; // optional, can default to []
    
}

export interface SentimentAnalyticsTestDTO {
    categories: SentimentAnalyticsCategoryDescriptor[];
}