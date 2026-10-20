import * as React from "react";

type IconNode = [string, Record<string, string>][];

/** Props accepted by every icon component. */
export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
};

/** Icons the kit's own components render; always shipped with a document. */
export const KIT_ICON_NAMES = [
  "AlertTriangle",
  "ArrowDown",
  "ArrowUp",
  "Check",
  "CheckCircle2",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronsUpDown",
  "Inbox",
  "Info",
  "Loader2",
  "Menu",
  "Minus",
  "Search",
  "X",
  "XCircle",
] as const;

const readIconRegistry = (): Record<string, IconNode> =>
  (globalThis as unknown as { __AVINTRA_ICONS__?: Record<string, IconNode> }).__AVINTRA_ICONS__ ??
  {};

const FALLBACK_NODE: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "9", "stroke-dasharray": "3 3" }],
];

const toReactAttributes = (attributes: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(attributes)
      .filter(([name]) => name !== "key")
      .map(([name, value]) => [
        name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
        value,
      ]),
  );

const renderIcon = (name: string, props: IconProps) => {
  const { size = 16, strokeWidth = 2, title, className, ...rest } = props;
  const node = readIconRegistry()[name] ?? FALLBACK_NODE;
  const labelled = Boolean(title || rest["aria-label"]);

  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: ["shrink-0", className].filter(Boolean).join(" "),
      "aria-hidden": labelled ? undefined : true,
      role: labelled ? "img" : undefined,
      focusable: "false",
      ...rest,
    },
    title ? React.createElement("title", null, title) : null,
    ...node.map(([tag, attributes], index) =>
      React.createElement(tag, { key: index, ...toReactAttributes(attributes) }),
    ),
  );
};

const iconCache = new Map<string, React.FC<IconProps>>();

/** Returns the component for a lucide icon name such as "Search" or "ArrowUpRight". */
export const getIcon = (name: string): React.FC<IconProps> => {
  const cached = iconCache.get(name);
  if (cached) return cached;
  const component: React.FC<IconProps> = (props) => renderIcon(name, props);
  component.displayName = `Icons.${name}`;
  iconCache.set(name, component);
  return component;
};

/** Lucide icon set addressed by name, for example `<Icons.Search size={16} />`. */
export const Icons = new Proxy({} as Record<string, React.FC<IconProps>>, {
  get: (_target, property) => (typeof property === "string" ? getIcon(property) : undefined),
});

/** An icon given either by lucide name or as a ready element. */
export type IconInput = string | React.ReactElement | null | undefined;

/** Renders an icon given by name or element. */
export const KitIcon = ({ icon, ...props }: IconProps & { icon: IconInput }) => {
  if (!icon) return null;
  if (typeof icon === "string") return renderIcon(icon, props);
  return icon;
};
