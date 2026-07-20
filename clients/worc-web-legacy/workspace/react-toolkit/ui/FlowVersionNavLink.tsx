import { cn } from "@aventisia/ui/lib";
import { NavLink, NavLinkProps } from "react-router-dom";

interface FlowVersionNavLinkProps extends Omit<NavLinkProps, "children"> {
  flowName: string;
  flowVersionNumber: string;
}

/**
 * FlowVersionNavLink component renders a link to a specific flow version.
 */
export const FlowVersionNavLink = ({
  flowName,
  flowVersionNumber,
  to,
  className,
  ...props
}: FlowVersionNavLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={to}
      className={cn(
        "group inline-flex h-5 w-auto text-sm cursor-pointer truncate font-normal text-foreground hover:text-primary",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary">
        <span className="truncate max-w-72">{flowName}</span>
        <span className="bg-slate-100 border group-hover:border-primary-100 group-hover:text-primary text-2xs rounded-xl h-[1.1rem] px-1.5 text-muted-foreground">
          {flowVersionNumber}
        </span>
      </span>
    </NavLink>
  );
};
