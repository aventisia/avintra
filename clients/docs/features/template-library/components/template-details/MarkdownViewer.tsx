"use client"
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownViewer = ({ textValue }: { textValue: string }) => {

    const components: Components = {
        // Headers with custom styling
        h1: ({ children }) => (
            <h2 className="not-first:mt-6 mb-4 border-b border-gray-300 pb-1 text-3xl font-semibold tracking-tight text-slate-900 dark:border-gray-600 dark:text-slate-100">
                {children}
            </h2>
        ),
        h2: ({ children }) => (
            <h2 className="not-first:mt-6 mb-4 border-b border-gray-300 pb-1 text-3xl font-semibold tracking-tight text-slate-900 dark:border-gray-600 dark:text-slate-100">
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="mb-4 mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className="mb-4 mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {children}
            </h4>
        ),
        h5: ({ children }) => (
            <h5 className="mb-3 mt-3 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {children}
            </h5>
        ),
        h6: ({ children }) => (
            <h6 className="mb-2 mt-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {children}
            </h6>
        ),
        // Paragraphs
        p: ({ children }) => (
            <p className="not-first:mt-6 leading-7 text-gray-700 dark:text-gray-300">
                {children}
            </p>
        ),

        // Strong text
        strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {children}
            </strong>
        ),

        code({ className, children, ...props }) {
            const value = String(children).replace(/\n$/, "");
            const language = className?.replace("language-", "");

            // Block code (fenced with ```lang)
            if (language) {
                return (
                    <div className="not-prose my-4">
                        <pre className="relative overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-sm leading-relaxed dark:bg-zinc-950">
                            <code className="text-zinc-100 dark:text-zinc-200" {...props}>
                                {value}
                            </code>
                            {language && (
                                <span className="absolute right-2 top-2 text-xs uppercase tracking-wider text-zinc-400">
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
                    className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
            <tr className="m-0 border-t border-gray-300 bg-background p-0 even:bg-slate-50 dark:border-gray-600 even:dark:bg-gray-600/20">
                {children}
            </tr>
        ),
        th: ({ children }) => (
            <th className="m-0 border border-gray-300 px-4 py-2 text-left font-semibold dark:border-gray-600">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="m-0 border border-gray-300 px-4 py-2 dark:border-gray-600">
                {children}
            </td>
        ),

        // Lists
        ul: ({ children }) => (
            <ul className="not-first:mt-6 list-disc space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="not-first:mt-6 list-decimal space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="my-2 dark:text-gray-300">{children}</li>
        ),

        // Blockquotes (for callouts/notes)
        blockquote: ({ children }) => (
            <div className="mt-6 flex overflow-x-auto rounded-lg border border-blue-200 bg-blue-100 py-2 pe-4 text-blue-900 dark:border-blue-200/30 dark:bg-blue-900/30 dark:text-blue-200">
                <div className="w-full min-w-0 leading-7">{children}</div>
            </div>
        ),

        a: (props) => (
            <a
                className="focus-visible:nextra-focus hover:text-primary/80 font-medium text-primary text-primary-600 underline decoration-from-font underline-offset-2 [text-underline-position:from-font] hover:no-underline"
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

}

export default MarkdownViewer