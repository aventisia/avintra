import SsoConnectionCard from "./SsoConnectionCard";
import PreferencesForm from "./PreferencesForm";

const Preferences = () => {
  // Return the single sign-on connection card above the preference switches
  return (
    <>
      <SsoConnectionCard />
      <PreferencesForm />
    </>
  );
};

export default Preferences;
