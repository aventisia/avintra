/** Component renders a simple and small footer with copyright information
 * and Terms of service, Privecy policy links */
const MinimalFooter = () => {
  return (
    <div className="flex items-center justify-center space-x-2 px-3 pb-1 text-xs text-muted-foreground xs:pb-0">
      <a
        href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}
        className="underline-offset-4 hover:text-primary hover:underline"
      >
        Terms of Service
      </a>
      <span className="mx-2 -mt-3.5 text-[1.5rem] text-slate-500">.</span>
      <a
        href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}
        className="underline-offset-4 hover:text-primary hover:underline"
      >
        Privacy Policy
      </a>
    </div>
  );
};

export { MinimalFooter };
