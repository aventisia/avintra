import { DotSeparator } from "@/react-toolkit/components/ui";

const Footer = () => {
  return (
    <div className="text-2xs flex items-center justify-center space-x-2 px-3 pb-1 text-muted-foreground xs:pb-0">
      <a
        href="/terms"
        className="underline-offset-4 hover:text-primary hover:underline"
      >
        Terms of Service
      </a>
      <DotSeparator />
      <a
        href="/privacy"
        className="underline-offset-4 hover:text-primary hover:underline"
      >
        Privacy Policy
      </a>
    </div>
  );
};

export { Footer };
