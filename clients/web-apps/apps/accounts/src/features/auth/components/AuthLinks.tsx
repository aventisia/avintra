import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Link } from "react-router-dom";

const authLinkClassName = cn(buttonVariants({ variant: "link" }), "text-body-sm");

type AuthRouteLinkProps = React.PropsWithChildren<{ to: string; onClick?: () => void }>;

/** A text link to another auth route, such as "Create an account". */
const AuthRouteLink = ({ to, onClick, children }: AuthRouteLinkProps) => (
  <Link className={authLinkClassName} to={to} onClick={onClick}>
    {children}
  </Link>
);

type AuthTextButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  isPending?: boolean;
  className?: string;
}>;

/** A text-styled button for a quiet in-step action, such as "Forgot password?". */
const AuthTextButton = ({
  onClick,
  isPending = false,
  className,
  children,
}: AuthTextButtonProps) => (
  <button
    type="button"
    className={cn(authLinkClassName, className)}
    disabled={isPending}
    aria-busy={isPending}
    onClick={onClick}
  >
    {children}
  </button>
);

export { AuthRouteLink, AuthTextButton };
