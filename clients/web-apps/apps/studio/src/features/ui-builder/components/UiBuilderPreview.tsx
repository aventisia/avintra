interface UiBuilderPreviewProps {
  html: string;
  title: string;
}

export const UiBuilderPreview = ({ html, title }: UiBuilderPreviewProps) => {
  if (!html.trim()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-muted-foreground">
        Describe the interface you want, then send your first prompt.
      </div>
    );
  }

  // IMPORTANT NOTE: generated HTML must only ever run inside a sandbox limited to
  // `allow-scripts`; adding `allow-same-origin` (or any other token) would let the
  // generated document reach the studio origin.
  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-white"
    />
  );
};
