import { Navbar } from "nextra-theme-docs";
import { AppLogo } from "./AppLogo";

export default function CustomNavbar() {
  return <Navbar logo={<AppLogo />} />;
}
