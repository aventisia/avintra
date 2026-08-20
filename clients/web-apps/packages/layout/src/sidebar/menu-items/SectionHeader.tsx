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
 * The header includes a horizontal rule (if applicable) and a title or a visual indicator,
 * depending on the sidebar's expansion state.
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
 * - A horizontal rule (`<hr>`) is conditionally rendered between sections, except for the first
 *   and last sections.
 * - The section name is displayed when the sidebar is expanded; otherwise, a small circular
 *   indicator is shown.
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
  menuSectionsLength,
  sectionHeaderAction: SectionHeaderAction,
}: SectionHeaderProps) => {
  // Get the sidebarExpand state from the base layout store
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  return (
    <>
      {index !== 0 && index !== menuSectionsLength && (
        <hr
          className={`mb-5 mt-5 border-gray-200 transition-all duration-500 ${sidebarExpand ? "mx-8" : "mx-5"}`}
        />
      )}
      <h3
        className={`mb-2 mt-4 flex h-5 items-center whitespace-nowrap text-2xs font-medium uppercase tracking-widest text-gray-500 transition-all duration-500 ${
          sidebarExpand
            ? "mx-6 pl-0.5 " + (SectionHeaderAction ? "justify-between pr-0" : "pr-3")
            : "mx-3 justify-center"
        }`}
      >
        {sidebarExpand ? (
          name
        ) : (
          <span className="block h-[0.5rem] w-[0.5rem] rounded-full bg-slate-400 transition-all duration-500"></span>
        )}
        {sidebarExpand && SectionHeaderAction && <SectionHeaderAction />}
      </h3>
    </>
  );
};

export { SectionHeader };
