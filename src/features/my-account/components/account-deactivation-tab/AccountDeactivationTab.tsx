import { FormCheck } from "@/components/Form";
import { Button } from "@/react-toolkit/ui/buttons/Button";

export const AccountDeactivationTab = () => {
  return (
    <div className="box box--stacked flex flex-col p-5">
      <div className="mb-6 flex items-center border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
        Account Deactivation
      </div>
      <div>
        <div className="leading-relaxed">
          When you initiate the account deletion process, you'll no longer have
          access to Front account services, and your personal data will be
          permanently removed. You have a 10-day window to cancel the deletion
          if needed.
        </div>
        <FormCheck className="mt-5">
          <FormCheck.Input id="checkbox-switch-1" type="checkbox" value="" />
          <FormCheck.Label htmlFor="checkbox-switch-1">
            Confirm that I want to delete my account.
          </FormCheck.Label>
        </FormCheck>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-dashed border-slate-300/70 pt-5 md:flex-row md:justify-end">
        <Button variant="outline" className="w-full px-4 md:w-auto">
          Learn More
        </Button>
        <Button
          variant="outline"
          className="border-danger/50 bg-danger/5 w-full px-4 md:w-auto"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
