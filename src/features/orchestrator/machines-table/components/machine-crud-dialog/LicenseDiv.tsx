import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";

type LicenseDivProps = {
  isReadOnly: boolean;
  value: string;
};
export const LicenseDiv = ({ isReadOnly, value }: LicenseDivProps) => {
  return (
    <div className="flex flex-col gap-4">
      {value !== "" && (
        <SelectField
          name="licenseType"
          label="License Type"
          isRequired={true}
          selectOptions={[]}
          disabled={isReadOnly}
        />
      )}
      <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
        <p className="font-light">Availabel Licenses:</p>
        <p>20</p>
      </div>
    </div>
  );
};
