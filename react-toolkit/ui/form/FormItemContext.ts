import React from "react";

type FormItemContextValue = {
  id: string;
};

// Part of shadcn/ui form components
export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);
