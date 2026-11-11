import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { useVariableSelectorStore } from "@/stores/variable-selector-store";

/**
 * Calls `insert` with a `{{variable}}` token whenever the variable selector picks a value for `name`.
 */
export const useVariableInsertion = (name: string, insert: (token: string) => void) => {
  const { inputName, selectedValue, setSelectedValue } = useVariableSelectorStore(
    useShallow((state) => ({
      inputName: state.inputName,
      selectedValue: state.selectedValue,
      setSelectedValue: state.setSelectedValue,
    })),
  );

  React.useEffect(() => {
    if (selectedValue && inputName === name) {
      insert(`{{${selectedValue}}}`);
      setSelectedValue("");
    }
  }, [selectedValue, setSelectedValue, inputName, name, insert]);
};
