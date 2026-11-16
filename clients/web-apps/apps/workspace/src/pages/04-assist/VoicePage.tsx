import { Suspense, lazy } from "react";

const VoiceSection = lazy(() =>
  import("@/features/04-assist/voice/components/VoiceSection").then((module) => ({
    default: module.VoiceSection,
  })),
);

/**
 * Renders the Voice page.
 * @returns JSX element representing the Voice page.
 */
export const VoicePage = () => {
  return (
    <Suspense>
      <VoiceSection />
    </Suspense>
  );
};
