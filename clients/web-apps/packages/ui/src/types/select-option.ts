/** Interface for Select, MultiSelector and RadioGroup component */
type ISelectOption = {
  /** Actual data which will be saved in database on selection */
  value: string;

  /** Label for the value, which will be visible for the user */
  label: string;

  /** Description for the label if user needs more informmation to select */
  description?: string;
};

export { type ISelectOption };
