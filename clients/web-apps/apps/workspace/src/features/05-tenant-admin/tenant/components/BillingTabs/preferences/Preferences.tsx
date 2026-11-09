import { RecordSection } from "@avplatform/ui/record-sheet";

import PreferencesForm from "./PreferencesForm";
import SsoConnectionCard from "./SsoConnectionCard.ee";

const Preferences = () => (
  <div className="grid items-start gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <RecordSection title="Sign-in security">
        <PreferencesForm />
      </RecordSection>
    </div>
    <SsoConnectionCard />
  </div>
);

export default Preferences;
