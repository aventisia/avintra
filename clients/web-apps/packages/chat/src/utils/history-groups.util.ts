export type ChatHistoryItem = { id: string; title: string; lastModifiedOn: string };

export type ChatHistoryGroup = { label: string; items: ChatHistoryItem[] };

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const labelFor = (daysAgo: number) => {
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return "Last 7 days";
  return "Older";
};

/**
 * Splits history, already newest first, into Today, Yesterday, Last 7 days
 * and Older by the viewer's local calendar day.
 */
export const groupHistoryByDate = (
  items: readonly ChatHistoryItem[],
  now = new Date(),
): ChatHistoryGroup[] => {
  const today = startOfDay(now);
  const groups: ChatHistoryGroup[] = [];
  for (const item of items) {
    // Rounding absorbs the hour a daylight-saving switch adds to or removes from a day.
    const daysAgo = Math.round((today - startOfDay(new Date(item.lastModifiedOn))) / DAY_MS);
    const label = labelFor(daysAgo);
    const group = groups.at(-1);
    if (group?.label === label) group.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
};
