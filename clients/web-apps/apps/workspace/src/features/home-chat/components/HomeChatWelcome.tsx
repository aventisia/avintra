import { useUserSessionStore } from "@avplatform/ui/stores";

const greetingFor = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

/** Home's empty-state greeting: time of day, the user's first name, and what Home can do. */
export const HomeChatWelcome = () => {
  const firstName = useUserSessionStore((state) => state.userSession?.firstName?.trim());
  const greeting = greetingFor(new Date().getHours());
  return (
    <div className="text-center">
      <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">
        {firstName ? `${greeting}, ${firstName}` : greeting}
      </h1>
      <p className="mt-2 text-base text-ink-2">
        Ask a question, or describe an interface, document, spreadsheet or deck to create.
      </p>
    </div>
  );
};
