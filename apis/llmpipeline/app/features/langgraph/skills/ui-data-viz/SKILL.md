---
name: ui-data-viz
description: Chart and KPI guidance for UI builder interfaces - choosing chart types, KPI tiles with deltas and formulas, date buckets, number formatting, and status colors with the runtime kit.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: ui-data-viz Skill Source
    url: ./
    type: source
tags:
  - design
  - ui
  - charts
---

# UI Data Visualization

Applied when an interface shows metrics or charts. Charts come from `Charts.*`, KPIs from
`UI.Stat`, and numbers from `UI.format`.

## Choosing the form

| Question the user asks | Use |
| --- | --- |
| How much right now? | `UI.Stat` with `delta` against the previous period |
| How is it changing over time? | `Charts.LineChart` (one or two series) or `Charts.AreaChart` (volume) |
| How do categories compare? | `Charts.BarChart`; `horizontal` when labels are long or there are more than 8 |
| What is the composition of a whole? | `Charts.DonutChart` with at most 6 slices; group the rest as "Other" |
| Parts of a total over time | `Charts.BarChart stacked` |
| Trend inside a table or tile | `Charts.Sparkline` |

Never use a donut for more than 6 categories, for values that do not add up to a whole, or to
compare periods. Never use 3D, dual axes, or more than 3 series in one line chart.

## KPI tiles

- 3 to 4 tiles per row (`UI.StatGrid`), each with a short label, one formatted value, and the
  comparison period in `deltaLabel`.
- Set `invertDelta` when lower is better (handling time, backlog, breaches) so the color is right.
- Use `formula` for every computed value so people can see how it is calculated.
- Show `loading` while data loads; show "—" (the formatter's default) for missing values.

## Charts

- Title each chart card with the question it answers ("Decisions per day"), describe the unit in
  the description, and add `UI.InfoHint` with the formula for computed series.
- Pass query rows directly: `x` is the group or bucket field, `y` the metric names. Give series
  readable labels with `y={[{ key: "approved", label: "Approved" }]}`.
- Use date buckets that fit the range: day up to ~45 days, week up to ~6 months, month beyond.
- Format axis values with `valueFormat={UI.format.compact}` for counts or a currency formatter for
  money. Percentages are fractions passed through `UI.format.percent`.
- Status breakdowns: label the donut by the status field and the kit applies status colors.
- Keep chart heights consistent within a row (default 260).

## Tables of numbers

Right-align numeric columns (`align: "right"`), format every value, sort by the most useful
measure by default (`initialSort`), and show units in the header ("Amount (USD)").
