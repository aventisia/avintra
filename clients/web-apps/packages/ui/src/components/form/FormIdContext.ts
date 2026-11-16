import { createContext, useContext } from "react";

const FormIdContext = createContext<string | undefined>(undefined);

export const FormIdProvider = FormIdContext.Provider;

/** Id of the enclosing `Form`, or undefined outside one. */
export const useFormId = () => useContext(FormIdContext);

const SubmitTargetFormIdContext = createContext<string | undefined>(undefined);

export const SubmitTargetFormIdProvider = SubmitTargetFormIdContext.Provider;

/** Form id that submit buttons rendered outside their form (by `CrudDialogActions`) must target. */
export const useSubmitTargetFormId = () => useContext(SubmitTargetFormIdContext);
