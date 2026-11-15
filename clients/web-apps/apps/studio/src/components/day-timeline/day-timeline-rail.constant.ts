// IMPORTANT NOTE: the rail offsets below are tied to the day header (36px) and entry row (46px)
// heights; change them together or the rail breaks around its markers.
const RAIL =
  "before:pointer-events-none before:absolute before:w-px before:bg-line before:content-[''] after:pointer-events-none after:absolute after:bottom-0 after:w-px after:bg-line after:content-['']";

/** Day header: 36px tall, 16px node centred at 18px. */
export const DAY_RAIL = `${RAIL} before:left-[23.5px] before:top-0 before:h-2 after:left-[23.5px] after:top-7`;

/** Entry row: 46px tall, 6px marker centred at 23px; offset by the 8px list inset. */
export const ENTRY_RAIL = `${RAIL} before:left-[15.5px] before:top-0 before:h-[17px] after:left-[15.5px] after:top-[29px]`;
