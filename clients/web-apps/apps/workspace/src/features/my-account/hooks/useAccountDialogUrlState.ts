import { useSearchParams } from "react-router-dom";

const ACCOUNT_TAB_PARAM = "account";

/** Account dialog state kept in the `account` search param (the open tab), so it survives a reload. */
export const useAccountDialogUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setAccountTab = (tab: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (tab) next.set(ACCOUNT_TAB_PARAM, tab);
    else next.delete(ACCOUNT_TAB_PARAM);
    setSearchParams(next, { replace: true });
  };

  return {
    accountTab: searchParams.get(ACCOUNT_TAB_PARAM),
    openAccountDialog: () => setAccountTab("profile"),
    setAccountTab,
  };
};
