import { useCallback, useState } from "react";

/** Toogle a boolean state. Helpful whenever we need to create a state just to toggle
 * @returns value (state) and toggleValue(state handler)
 */
const useToggle = (defaultValue: boolean): [boolean, (passedValue: boolean) => void] => {
  // Define state
  const [value, setValue] = useState<boolean>(defaultValue);

  // Define toggle handler
  const toggleValue = useCallback((passedValue: boolean) => {
    setValue((currentState) => (typeof passedValue === "boolean" ? passedValue : !currentState));
  }, []);

  // Return state and state handler
  return [value, toggleValue];
};

export { useToggle };
