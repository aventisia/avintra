import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownViewer = ({ textValue }: { textValue: string }) => {
  const components: Components = {
    // Headers with custom styling
    h1: ({ children }) => (
      <h2 className="mb-4 mt-10 border-b border-line pb-1 text-3xl font-semibold tracking-tight text-ink">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 border-b border-line pb-1 text-3xl font-semibold tracking-tight text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-ink">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-4 mt-7 text-xl font-semibold tracking-tight text-ink">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-3 mt-6 text-lg font-semibold tracking-tight text-ink">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-2 mt-5 text-base font-semibold tracking-tight text-ink">{children}</h6>
    ),
    // Paragraphs
    p: ({ children }) => <p className="not-first:mt-6 leading-7 text-ink-2">{children}</p>,

    // Strong text
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,

    code({ className, children, ...props }) {
      const value = String(children).replace(/\n$/, "");
      const language = className?.replace("language-", "");

      // Block code (fenced with ```lang)
      if (language) {
        return (
          <div className="not-prose my-4">
            <pre className="relative overflow-x-auto rounded-lg border border-line bg-sunken p-4 font-mono text-code">
              <code className="text-ink" {...props}>
                {value}
              </code>
              {language && (
                <span className="absolute right-2 top-2 font-mono text-label uppercase text-muted-foreground">
                  {language}
                </span>
              )}
            </pre>
          </div>
        );
      }

      // Inline code
      return (
        <code
          className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-ink-2"
          {...props}
        >
          {value}
        </code>
      );
    },
    // Tables
    table: ({ children }) => (
      <div className="mt-6 block overflow-x-auto p-0">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="m-0 border-t border-line bg-background p-0 even:bg-sunken">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="m-0 border border-line px-4 py-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="m-0 border border-line px-4 py-2">{children}</td>,

    // Lists
    ul: ({ children }) => <ul className="not-first:mt-6 list-disc space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="not-first:mt-6 list-decimal space-y-2">{children}</ol>,
    li: ({ children }) => <li className="my-2 text-ink-2">{children}</li>,

    // Blockquotes (for callouts/notes)
    blockquote: ({ children }) => (
      <div className="mt-6 flex overflow-x-auto rounded-lg border border-line bg-sunken py-2 pe-4 text-ink-2">
        <div className="w-full min-w-0 leading-7">{children}</div>
      </div>
    ),

    a: (props) => (
      <a
        className="focus-visible:nextra-focus hover:text-primary-text/80 font-medium text-primary-text underline decoration-from-font underline-offset-2 [text-underline-position:from-font] hover:no-underline"
        {...props}
      >
        {props.children}
        <svg
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.7"
          viewBox="0 0 24 24"
          height="1em"
          className="inline shrink-0 align-baseline"
        >
          <path d="M7 17L17 7"></path>
          <path d="M7 7h10v10"></path>
        </svg>
      </a>
    ),
  };

  return (
    <div className="prose-sm prose-slate max-w-none dark:prose-invert">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {textValue}
      </Markdown>
    </div>
  );
};

export default MarkdownViewer;
