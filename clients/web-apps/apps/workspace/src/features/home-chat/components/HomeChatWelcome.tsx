import { useUserSessionStore } from "@avplatform/ui/stores";

const greetingFor = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

/** Home's empty-state greeting: time of day, the user's first name, and what Home can do. A saved chat with no messages says so instead. */
export const HomeChatWelcome = ({ isSavedChat = false }: { isSavedChat?: boolean }) => {
  const firstName = useUserSessionStore((state) => state.userSession?.firstName?.trim());
  const greeting = greetingFor(new Date().getHours());
  if (isSavedChat)
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-ink">This chat has no messages</h2>
        <p className="mt-2 text-base text-ink-2">Send a message to continue it.</p>
      </div>
    );
  return (
    <div className="text-center">
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">
        {firstName ? `${greeting}, ${firstName}` : greeting}
      </h2>
      <p className="mt-2 text-base text-ink-2">
        Ask a question, or describe an interface, document or spreadsheet to create.
      </p>
    </div>
  );
};
