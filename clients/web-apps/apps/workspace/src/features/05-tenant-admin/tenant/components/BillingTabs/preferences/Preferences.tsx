import PreferencesForm from "./PreferencesForm";
import SsoConnectionCard from "./SsoConnectionCard.ee";

const Preferences = () => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <SsoConnectionCard />
      </div>
      <PreferencesForm />
    </>
  );
};

export default Preferences;
