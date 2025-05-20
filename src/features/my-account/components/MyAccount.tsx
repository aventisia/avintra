import { Outlet } from "react-router-dom";

import { ProfileCover } from "@/features/my-account/components/ProfileCover";
import { MyAccountSidebar } from "@/features/my-account/components/Sidebar";

export function MyAccount() {
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <div className="col-span-12">
        <div className="mt-3.5 grid grid-cols-12 gap-x-6 gap-y-10">
          <MyAccountSidebar />
          <div className="col-span-12 flex flex-col gap-y-7 xl:col-span-9">
            <ProfileCover />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
