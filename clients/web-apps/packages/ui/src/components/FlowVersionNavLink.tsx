import { cn } from "@avplatform/ui/lib";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";

interface FlowVersionNavLinkProps extends Omit<NavLinkProps, "children"> {
  flowName: ReactNode;
  flowVersionNumber: string;
}

/** Props that are valid on a native anchor element. */
type AnchorProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel" | "title" | "draggable"
>;

/**
 * Detects whether the target is an external (absolute/cross-origin) URL.
 * React Router's NavLink cannot navigate to external URLs, so those must be
 * rendered as a native anchor to trigger a full browser page load.
 *
 * The Agent Builder (studio) is a separate app served at the `/studio/` base
 * path. When a link targets `/studio/...` from another app (e.g. workspace),
 * it must be treated as external so it performs a full page load to the studio
 * app instead of being resolved as an internal route (which would 404).
 */
const isExternalUrl = (to: NavLinkProps["to"]): boolean =>
  typeof to === "string" && (/^https?:\/\//i.test(to) || to.startsWith("/studio/"));

/**
 * FlowVersionNavLink component renders a link to a specific flow version.
 * External URLs (e.g. the Agent Builder / studio on a different origin) use a
 * native anchor so they open correctly, while internal routes keep using the
 * router-aware NavLink.
 */
export const FlowVersionNavLink = ({
  flowName,
  flowVersionNumber,
  to,
  className,
  target,
  rel,
  title,
  draggable,
  ..._navProps
}: FlowVersionNavLinkProps) => {
  const external = isExternalUrl(to);

  // Shared link styling
  const linkClassName = cn(
    "group inline-flex h-5 w-auto cursor-pointer truncate text-body-sm font-normal text-ink hover:text-primary-text",
    className,
  );

  const content = (
    <>
      <span className="inline-flex font-medium items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary-text">
        <span className="truncate max-w-72">{flowName}</span>
        <span className="inline-flex h-[18px] items-center rounded-sm border border-line bg-fill px-1.5 font-mono text-[11px] leading-none text-ink-2 group-hover:border-primary-text/35 group-hover:text-primary-text">
          {flowVersionNumber}
        </span>
      </span>
    </>
  );

  const anchorProps: AnchorProps = {
    ...(target !== undefined && { target }),
    ...(rel !== undefined && { rel }),
    ...(title !== undefined && { title }),
    ...(draggable !== undefined && { draggable }),
  };

  if (external) {
    return (
      <a
        href={String(to)}
        className={linkClassName}
        rel={
          anchorProps.rel ?? (anchorProps.target === "_blank" ? "noopener noreferrer" : undefined)
        }
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      className={linkClassName}
      target={target}
      rel={rel}
      title={title}
      draggable={draggable}
      {..._navProps}
    >
      {content}
    </NavLink>
  );
};
