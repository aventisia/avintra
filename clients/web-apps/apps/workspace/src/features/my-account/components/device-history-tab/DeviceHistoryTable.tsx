import { createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";

interface DeviceHistoryTableProps
  extends React.PropsWithChildren, React.ComponentPropsWithoutRef<"table"> {
  dark?: boolean;
  bordered?: boolean;
  hover?: boolean;
  striped?: boolean;
  sm?: boolean;
}

const tableContext = createContext<{
  dark: DeviceHistoryTableProps["dark"];
  bordered: DeviceHistoryTableProps["bordered"];
  hover: DeviceHistoryTableProps["hover"];
  striped: DeviceHistoryTableProps["striped"];
  sm: DeviceHistoryTableProps["sm"];
}>({
  dark: false,
  bordered: false,
  hover: false,
  striped: false,
  sm: false,
});
function DeviceHistoryTable({
  className,
  dark,
  bordered,
  hover,
  striped,
  sm,
  ...props
}: DeviceHistoryTableProps) {
  return (
    <tableContext.Provider
      value={{
        dark: dark,
        bordered: bordered,
        hover: hover,
        striped: striped,
        sm: sm,
      }}
    >
      <table
        className={twMerge([
          "w-full text-left",
          dark && "bg-dark text-white dark:bg-black/30",
          className,
        ])}
        {...props}
      >
        {props.children}
      </table>
    </tableContext.Provider>
  );
}

interface DeviceHistoryTableTheadProps
  extends React.PropsWithChildren, React.ComponentPropsWithoutRef<"thead"> {
  variant?: "default" | "light" | "dark";
}

const theadContext = createContext<{
  variant: DeviceHistoryTableTheadProps["variant"];
}>({
  variant: "default",
});
const Thead = ({ className, ...props }: DeviceHistoryTableTheadProps) => {
  return (
    <theadContext.Provider
      value={{
        variant: props.variant,
      }}
    >
      <thead
        className={twMerge([
          props.variant === "light" && "bg-slate-200/60 dark:bg-slate-200",
          props.variant === "dark" && "bg-dark text-white dark:bg-black/30",
          className,
        ])}
        {...props}
      >
        {props.children}
      </thead>
    </theadContext.Provider>
  );
};

type DeviceHistoryTableTbodyProps = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<"tbody">
>;

const Tbody = ({ className, ...props }: DeviceHistoryTableTbodyProps) => {
  return <thead className={className}>{props.children}</thead>;
};

type DeviceHistoryTableTrProps = React.PropsWithChildren & React.ComponentPropsWithoutRef<"tr">;

const Tr = ({ className, ...props }: DeviceHistoryTableTrProps) => {
  const table = useContext(tableContext);
  return (
    <tr
      className={twMerge([
        table.hover &&
          "[&:hover_td]:dark:bg-darkmode-300 [&:hover_td]:bg-slate-100 [&:hover_td]:dark:bg-opacity-50",
        table.striped &&
          "[&:nth-of-type(odd)_td]:dark:bg-darkmode-300 [&:nth-of-type(odd)_td]:bg-slate-100 [&:nth-of-type(odd)_td]:dark:bg-opacity-50",
        className,
      ])}
      {...props}
    >
      {props.children}
    </tr>
  );
};

type DeviceHistoryTableThProps = React.PropsWithChildren & React.ComponentPropsWithoutRef<"th">;

const Th = ({ className, ...props }: DeviceHistoryTableThProps) => {
  const table = useContext(tableContext);
  const thead = useContext(theadContext);
  return (
    <th
      className={twMerge([
        "dark:border-darkmode-300 border-b-2 px-5 py-3 font-medium",
        thead.variant === "light" && "border-b-0 text-slate-700",
        thead.variant === "dark" && "border-b-0",
        table.dark && "dark:border-darkmode-300 border-slate-600",
        table.bordered && "border-l border-r border-t",
        table.sm && "px-4 py-2",
        className,
      ])}
      {...props}
    >
      {props.children}
    </th>
  );
};

type DeviceHistoryTableTdProps = React.PropsWithChildren & React.ComponentPropsWithoutRef<"td">;

const Td = ({ className, ...props }: DeviceHistoryTableTdProps) => {
  const table = useContext(tableContext);
  return (
    <td
      className={twMerge([
        "dark:border-darkmode-300 border-b px-5 py-3",
        table.dark && "dark:border-darkmode-300 border-slate-600",
        table.bordered && "border-l border-r border-t",
        table.sm && "px-4 py-2",
        className,
      ])}
      {...props}
    >
      {props.children}
    </td>
  );
};

DeviceHistoryTable.Thead = Thead;
DeviceHistoryTable.Tbody = Tbody;
DeviceHistoryTable.Tr = Tr;
DeviceHistoryTable.Th = Th;
DeviceHistoryTable.Td = Td;

export default DeviceHistoryTable;
