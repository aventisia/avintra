const MARK_SHADOW = "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_-4px_rgba(15,23,42,0.1)]";

/**
 * Motion transition shared by the access panels and allow-list rows.
 */
const PANEL_TRANSITION = { duration: 0.22, ease: [0.32, 0.72, 0, 1] } as const;

export { MARK_SHADOW, PANEL_TRANSITION };
