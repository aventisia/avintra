import { Button } from "@avplatform/ui/buttons";

import { SetupCard } from "./components/SetupCard";

interface SignInPageProps {
  isStarting: boolean;
  error: string | null;
  onSignIn: () => void;
}

export default function SignInPage({ isStarting, error, onSignIn }: SignInPageProps) {
  return (
    <SetupCard
      title="Sign in to Avintra"
      subtitle="Sign in through your browser. This window continues on its own once you are done."
    >
      {error ? <p className="text-hint text-bad">{error}</p> : null}

      <Button type="button" className="w-full" disabled={isStarting} onClick={onSignIn}>
        {isStarting ? "Opening your browser..." : "Sign in with your browser"}
      </Button>
    </SetupCard>
  );
}
