import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownViewer = ({ textValue }: { textValue: string }) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-3xl font-bold text-foreground" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl font-semibold text-foreground" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl font-medium text-foreground" {...props} />
          ),
          h4: (props) => (
            <h4 className="text-lg font-medium text-foreground" {...props} />
          ),
          h5: (props) => (
            <h5
              className="text-base font-semibold text-foreground"
              {...props}
            />
          ),
          h6: (props) => (
            <h6
              className="text-sm font-semibold uppercase tracking-wide text-foreground"
              {...props}
            />
          ),

          p: (props) => (
            <p className="my-2 leading-7 text-foreground" {...props} />
          ),

          a: (props) => (
            <a
              className="hover:text-primary/80 font-medium text-primary underline underline-offset-2"
              {...props}
            />
          ),

          code: ({ ...props }) => (
            <code
              className="rounded bg-accent px-1 py-0.5 font-mono text-xs text-accent-foreground"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-border pl-4 italic text-muted-foreground"
              {...props}
            />
          ),

          ul: (props) => (
            <ul
              className="list-disc space-y-2 pl-6 text-foreground"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="list-decimal space-y-2 pl-6 text-foreground"
              {...props}
            />
          ),

          table: (props) => (
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg border border-border text-left text-sm">
                {props.children}
              </table>
            </div>
          ),
          th: (props) => (
            <th
              className="border border-border bg-muted px-3 py-2 font-semibold text-foreground"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-border px-3 py-2 text-foreground"
              {...props}
            />
          ),
          hr: () => <hr className="my-7 border-border" />,
        }}
      >
        {textValue}
      </Markdown>
    </div>
  );
};

export default MarkdownViewer;
