import { type SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import { Fragment, useEffect, useReducer } from "react";

import { loadCodeLanguage, tokenizeCode } from "../utils/highlight-code.util";

/** Fenced code colored by Shiki once its grammar loads; plain text until then. */
export const ChatCodeBlock = ({
  components: { Pre, Code },
  language,
  code,
}: Omit<SyntaxHighlighterProps, "node">) => {
  const lang = language.toLowerCase();
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    let isCurrent = true;
    void loadCodeLanguage(lang).then((loaded) => isCurrent && loaded && rerender());
    return () => {
      isCurrent = false;
    };
  }, [lang]);

  const lines = tokenizeCode(code, lang);
  return (
    // IMPORTANT NOTE: assistant-ui memoizes Pre and Code on the markdown node and ignores new children; the key remounts them once tokens arrive.
    <Pre key={lines ? "highlighted" : "plain"}>
      <Code className="[&_span]:font-mono [&_span]:text-[color:var(--shiki-light)] dark:[&_span]:text-[color:var(--shiki-dark)]">
        {lines
          ? lines.map((tokens, index) => (
              <Fragment key={index}>
                {index > 0 && "\n"}
                {tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={token.htmlStyle}>
                    {token.content}
                  </span>
                ))}
              </Fragment>
            ))
          : code}
      </Code>
    </Pre>
  );
};
