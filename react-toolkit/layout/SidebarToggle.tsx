import { cn } from "@/react-toolkit/lib/utils";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";

interface SidebarToggleProps {
  className?: string;
}

const SidebarToggle = ({ className }: SidebarToggleProps) => {
  const { sidebarExpand, setSidebarExpand } = useBaseLayoutStore();

  return (
    <Button
      variant="outline"
      size="icon8"
      className={cn(
        "mr-3.5 h-8 w-8 rounded-lg border-none bg-transparent",
        className,
      )}
      onClick={() => setSidebarExpand(!sidebarExpand)}
    >
      <Bars3BottomLeftIcon className="h-7 w-7" />
    </Button>
  );
};

export { SidebarToggle };
