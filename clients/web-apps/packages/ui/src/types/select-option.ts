/** Interface for Select, MultiSelector and RadioGroup component */
interface ISelectOption {
  value: string;
  label: string;
  description?: string;
  disable?: boolean;
  /** fixed/default option that can't be removed. */
  fixed?: boolean;
}

export { type ISelectOption };
