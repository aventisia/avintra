import { MY_ACCOUNT_SIDEBAR_LINKS } from "../constants/sidebar-links";
import { MyAccountSidebarLink } from "./SidebarLink";

export const MyAccountSidebar = () => {
  return (
    <div className="relative col-span-12 xl:col-span-3">
      <div className="sticky top-3.5">
        <div className="box box--stacked flex flex-col px-5 pb-6 pt-5">
          {MY_ACCOUNT_SIDEBAR_LINKS.map((link) => (
            <MyAccountSidebarLink
              key={link.linkLabel}
              linkLabel={link.linkLabel}
              linkTo={link.linkTo}
              linkIcon={link.linkIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
