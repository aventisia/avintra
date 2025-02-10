import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { useShallow } from "zustand/react/shallow";

export const EmailSettingsTab = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  return (
    // <Form
    //   methods={form}
    //   onSubmit={form.handleSubmit(onSubmit)}
    //   className="px-2.5 pb-5"
    //   disabled={isReadMode}
    // >
    <div className="box box--stacked flex flex-col p-5">
      <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
        Email Settings
      </div>
      <div>
        <div className="text-slate-500">
          Your current email address is
          <span className="font-medium">{userSession?.email}</span>.
        </div>
        <div className="mt-2 block flex-col pt-5 first:mt-0 first:pt-0 sm:flex xl:flex-row xl:items-center">
          <label className="mb-2 inline-block sm:mb-0 sm:mr-5 sm:text-right xl:mr-14 xl:w-60">
            {""}
            <div className="text-left">
              <div className="flex items-center">
                <div className="font-medium">New Email Address</div>
                <div className="dark:bg-darkmode-300 ml-2.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Required
                </div>
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400 xl:mt-3">
                Please provide a valid email address that you have access to.
              </div>
            </div>
          </label>
          <div className="mt-3 w-full flex-1 xl:mt-0">
            <InputField
              name="newEmail"
              type="text"
              placeholder="example@example.com"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
        <Button
          variant="outline"
          className="border-primary/50 w-full px-4 md:w-auto"
        >
          Save Changes
        </Button>
      </div>
    </div>
    // </Form>
  );
};
