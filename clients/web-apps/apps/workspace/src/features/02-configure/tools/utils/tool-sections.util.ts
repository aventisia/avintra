type ToolRow = {
  original: {
    isPopular?: boolean;
  };
};

export type ToolSection<TRow extends ToolRow> = {
  key: "popular" | "other";
  title: string;
  rows: TRow[];
};

/**
 * Splits rows into Popular Tools and All Other Tools, dropping empty sections.
 */
export const buildToolSections = <TRow extends ToolRow>(rows: TRow[]): ToolSection<TRow>[] => {
  const sections: ToolSection<TRow>[] = [
    {
      key: "popular",
      title: "Popular Tools",
      rows: rows.filter((row) => row.original.isPopular),
    },
    {
      key: "other",
      title: "All Other Tools",
      rows: rows.filter((row) => !row.original.isPopular),
    },
  ];

  return sections.filter((section) => section.rows.length > 0);
};
