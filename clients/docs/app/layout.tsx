import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Layout } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import CustomFooter from "./_components/CustomFooter";
import CustomHead from "./_components/CustomHead";
import CustomNavbar from "./_components/CustomNavbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"], // Supports Latin characters
  variable: "--font-inter", // Custom CSS variable for font
  display: "swap", // Ensures faster font loading
});

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={inter.variable}
      suppressHydrationWarning
    >
      <CustomHead />
      <body>
        <Layout
          navbar={<CustomNavbar />}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/aventisia/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          footer={<CustomFooter />}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL("https://aventisia.com"),
  title: {
    default: "Docs - Aventisia",
    template: "%s | Aventisia",
  },
  description:
    "Build AI in your daily workflows, boost productivity, and drive growth with our cutting-edge SaaS platform, with code-level control when you need it and no code when you don't.",
  keywords: [
    "aventisia",
    "workflows",
    "ai",
    "saas",
    "platform",
    "docs",
    "agent",
    "software",
    "digital",
    "data",
  ],
  applicationName: "Aventisia Docs",
  appleWebApp: {
    title: "Docs - Aventisia",
  },
  appLinks: {
    web: {
      url: "https://aventisia.com",
      should_fallback: true,
    },
  },
};
