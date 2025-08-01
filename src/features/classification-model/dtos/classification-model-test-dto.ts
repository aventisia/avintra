// Level 3
export interface ISubSubCategoryDescriptor {
    id?: string;
    name: string;
    value: boolean;
  }
  
// Level 2
export interface ISubCategoryDescriptor {
    id?: string;
    name: string;
    value: boolean;
    subSubCategories: ISubSubCategoryDescriptor[] | null;
}
  
// Level 1
export interface ClassificationCategoryDescriptor {
    id?: string;
    name: string;
    value: boolean;
    subCategories: ISubCategoryDescriptor[] | null;
}

  export interface ClassificationTestDTO {
    categories: ClassificationCategoryDescriptor[];
  }
  