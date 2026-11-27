import { Button } from "@avplatform/ui/buttons";

import { SetupCard } from "./components/SetupCard";

interface WaitingPageProps {
  onOpenBrowserAgain: () => void;
  onCancel: () => void;
}

export default function WaitingPage({ onOpenBrowserAgain, onCancel }: WaitingPageProps) {
  return (
    <SetupCard
      title="Waiting for your browser"
      subtitle="Finish signing in in your browser. This window continues on its own."
    >
      <Button type="button" className="w-full" onClick={onOpenBrowserAgain}>
        Open browser again
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
        Cancel
      </Button>
    </SetupCard>
  );
}
