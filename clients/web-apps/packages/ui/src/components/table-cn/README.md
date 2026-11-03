# TableCN

TableCN is the data table for every web app, ported from [tablecn](https://github.com/sadmann7/tablecn) (MIT). It replaced the legacy `components/data-table`; the CRUD dialog pieces that lived there moved to `@avplatform/ui/crud-dialog`.

Import it from `@avplatform/ui/table-cn`.

## Differences from tablecn

tablecn targets TanStack Table v9, React 19, Tailwind 4, nuqs, and Next.js. This port targets what the apps run: TanStack Table v8, React 18, Tailwind 3, and react-router 6.

- **URL state**: built on react-router's `useSearchParams`, not nuqs. The hook needs a router context.
- **Client only**: rows are filtered, sorted, and paged in the browser. Server paging is not ported yet.
- **Not ported**: the advanced toolbar (filter list and menu with operators and AND/OR), drag reordering in the sort menu, and the `boolean` and `range` (slider) filter variants.
- **Additions**: a global search (`searchColumns`, and `searchPlaceholder` on `TableCNToolbar`; "/" focuses it), `persistKey`, `getRowProps` and `label` on `TableCN`, Shift+click range selection in the select column, and `exportTableCNToCsv`.
- **Look**: TableCN has its own table elements (`primitives/TableCNElements`) and does not use the legacy `TableExt`. The table sits in a card with the pagination as its footer. Selected rows get a tint and an indigo edge. Popovers and menus share `TABLE_CN_PANEL_CLASS_NAME`.

## State

| State                              | Lives in                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Page, page size, sorting           | URL: `page`, `perPage`, `sort` (renamable with `queryKeys`)                                                                            |
| Column filters                     | URL: one parameter per filterable column id                                                                                            |
| Column visibility, sorting default | `localStorage` (`table-cn:<persistKey>`), only when `persistKey` is set; a saved entry never hides a column with `enableHiding: false` |
| Row selection, global search       | React state; search can be controlled                                                                                                  |

- A parameter equal to its default is left out of the URL. `sort=` (empty) means "no sorting" when the default sorts.
- Filter edits show at once and reach the URL after `debounceMs` (300 ms).
- The page is kept when data changes and is clamped to the last page. It returns to page 1 when the search text, a column filter, or the page size changes.
- URL formats: sorting `name.desc,createdOn.asc`; dates `2026-10-23` (local); `dateRange` filters `2026-10-01,2026-10-23`; selects `a,b`, quoting values that contain commas.

## Usage

```tsx
const columns = useMemo<ColumnDef<Job>[]>(
  () => [
    getTableCNSelectColumn<Job>(),
    {
      accessorKey: "status",
      header: ({ column }) => <TableCNColumnHeader column={column} label="Status" />,
      meta: { label: "Status", variant: "multiSelect", options: STATUS_OPTIONS },
    },
    getTableCNActionsColumn<Job>({ actions: ({ row }) => <JobRowActionItems job={row.original} /> }),
  ],
  [],
);

const { table } = useTableCN({
  data: jobs,
  columns,
  getRowId: (job) => job.id,
  persistKey: "jobs",
  searchColumns: ["name"],
  initialState: { columnPinning: { right: ["actions"] } },
});

return (
  <TableCN table={table} label="Jobs" actionBar={<JobsActionBar table={table} />}>
    <TableCNToolbar table={table} searchPlaceholder="Search jobs...">
      <TableCNSortMenu table={table} />
    </TableCNToolbar>
  </TableCN>
);
```

A column gets a toolbar filter and a URL parameter when it sets `meta.variant` (`text`, `number`, `date`, `dateRange`, `select`, `multiSelect`). It also gets the matching filter function, unless it defines its own `filterFn`. Pin the actions column with `columnPinning` so it stays visible while the table scrolls sideways. Use `TableCNSkeleton` while the data loads.

## Layout

- `hooks/`: `useTableCN` (table and state) and `useTableCNUrlState` (URL read and write)
- `utils/`: URL, filter value, filter function, column index, storage, and pinning helpers, all pure and covered by `__tests__/`
- `filters/`: toolbar filters (input, faceted, date)
- `columns/`: select and actions column helpers, and `TableCNRowActionsMenu`
- `action-bar/`: selection action bar (`TableCNActionBarSelection`, `TableCNActionBarSeparator`, and `TableCNActionBarItem` with an `icon` and a `destructive` tone)
- `primitives/`: table elements and checkbox
