import nextra from "nextra";

const withNextra = nextra({
  // contentDirBasePath: The base path for your content directory. As per nextra docs, if folder name is "content", you can omit this but getting error if not provided.
  contentDirBasePath: "/",
  defaultShowCopyCode: true,
  // ... Other Nextra config options
});

// You can include other Next.js configuration options here, in addition to Nextra settings:
export default withNextra({
  // NOTE: To run npm run start after build, we need to remove or comment out - output: "export"
  output: "export", // Enables static export.
  images: {
    unoptimized: true, // Required for Next.js static export
  },
  // ... Other Next.js config options
});
