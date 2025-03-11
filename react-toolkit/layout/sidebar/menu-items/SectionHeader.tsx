import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";

interface SectionHeaderProps {
  index: number;
  name: string;
  menuSectionsLength: number;
}

const SectionHeader = ({
  index,
  name,
  menuSectionsLength,
}: SectionHeaderProps) => {
  const { sidebarExpand } = useBaseLayoutStore();

  return (
    <>
      {index !== 0 && index !== menuSectionsLength && (
        <hr
          className={`mb-5 mt-5 border-gray-200 transition-all duration-500 ${sidebarExpand ? "mx-8" : "mx-5"}`}
        />
      )}
      <h3
        className={`mb-2 mt-4 flex h-5 items-center whitespace-nowrap text-2xs font-medium uppercase tracking-widest text-gray-500 transition-all duration-500 ${
          sidebarExpand ? "mx-6 pl-0.5 pr-3" : "mx-3 justify-center"
        }`}
      >
        {sidebarExpand ? (
          name
        ) : (
          <span className="block h-[0.5rem] w-[0.5rem] rounded-full bg-slate-400 transition-all duration-500"></span>
        )}
      </h3>
    </>
  );
};

export { SectionHeader };
