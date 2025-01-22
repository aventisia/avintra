/** Dto to receive data for Select, MultiSelector and RadioGroup
 * like components where selection will happen. This can be used
 * as type for the same components for local data
 */
interface SelectOptionDto {
  /** Actual data which will be saved in database on selection */
  value: string;

  /** Label for the value, which will be visible for the user */
  label: string;

  /** Description for the label if user needs more informmation to select */
  description?: string;

  /** Set this true if wants to make some of the value/label disabled so that user can't select those */
  disable?: boolean;

  /** Fixed/default option that can't be removed from selection. Mostly helpful in MultiSelector */
  fixed?: boolean;
}

export { type SelectOptionDto };
