import * as ChartsModule from "./charts";
import { cn } from "./cn.util";
import { DataTable, getPath } from "./data-table";
import { format } from "./format.util";
import * as Forms from "./forms";
import { Icons } from "./icons";
import * as Layout from "./layout";
import * as Overlays from "./overlays";
import * as Primitives from "./primitives";

const UI = {
  ...Primitives,
  ...Forms,
  ...Overlays,
  ...Layout,
  DataTable,
  getPath,
  format,
  cn,
};

const Charts = {
  BarChart: ChartsModule.BarChart,
  LineChart: ChartsModule.LineChart,
  AreaChart: ChartsModule.AreaChart,
  DonutChart: ChartsModule.DonutChart,
  Sparkline: ChartsModule.Sparkline,
};

(globalThis as unknown as { AvintraKit: unknown }).AvintraKit = { UI, Charts, Icons };
