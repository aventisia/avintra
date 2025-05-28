import { Header, HeaderContainer } from "@aventisia/ui/layout";
import LeftHeaderSection from "./LeftHeaderSection";
import RightHeaderSection from "./RightHeaderSection";

const AppHeader: React.FC = () => {
  return (
    <HeaderContainer className="fixed !bg-slate-200">
      <Header>
        <LeftHeaderSection />
        <RightHeaderSection />
      </Header>
    </HeaderContainer>
  );
};

export default AppHeader;
