import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

interface SectionHeaderProps {
  index: number;
  name: string;
  menuSectionsLength: number;
  sectionHeaderAction?: React.ComponentType;
}

/**
 * A React functional component that renders a section header for a sidebar menu.
 * Shows the uppercase group label when the sidebar is expanded, and a short separator
 * between groups on the collapsed rail.
 *
 * @param {SectionHeaderProps} props - The properties passed to the component.
 * @param {number} props.index - The index of the current section in the menu.
 * @param {string} props.name - The name of the section to display.
 * @param {number} props.menuSectionsLength - The total number of sections in the menu.
 *
 * @returns {JSX.Element} The rendered section header component.
 *
 * @remarks
 * - The component uses the `useBaseLayoutStore` hook to retrieve the `sidebarExpand` state,
 *   which determines the layout and appearance of the section header.
 * - On the collapsed rail, a separator is rendered before every section except the first.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   index={1}
 *   name="Dashboard"
 *   menuSectionsLength={5}
 * />
 * ```
 */
const SectionHeader = ({
  index,
  name,
  sectionHeaderAction: SectionHeaderAction,
}: SectionHeaderProps) => {
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  if (!sidebarExpand) {
    return index === 0 ? null : <hr className="mx-auto my-2 w-6 border-line" />;
  }

  return (
    <h3 className="flex h-[34px] items-end justify-between gap-2 whitespace-nowrap px-2 pb-[5px] font-mono text-label uppercase text-muted-foreground">
      {name}
      {SectionHeaderAction && <SectionHeaderAction />}
    </h3>
  );
};

export { SectionHeader };
