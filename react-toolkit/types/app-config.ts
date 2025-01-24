import { INavDataType } from "@/react-toolkit/types/nav-data-types";
import { ISearchBoxOptions } from "@/react-toolkit/types/search-box-options";

interface IAppConfig {
  appMaxWidth?: string;
  showUpgradeCard: boolean;
  searchBoxOptions: ISearchBoxOptions;
  showChatAssistant: boolean;
  navData: INavDataType;
}

export { type IAppConfig };
