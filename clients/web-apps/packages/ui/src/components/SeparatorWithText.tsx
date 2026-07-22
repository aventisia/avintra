// Summary: Visually or semantically separates content.
// Props 1: width - To set the width of the separtor. Default - 100%
// Props 2: overlayText - To set the text over the separator. Default - null

interface SeparatorWithTextProps {
  width?: string;
  overlayText?: string;
}

const SeparatorWithText = ({ width = "100%", overlayText }: SeparatorWithTextProps) => {
  return (
    <div className="flex w-full justify-center">
      <div style={{ width: width }} className="flex items-center">
        <span className="h-[0.5px] flex-grow rounded bg-border"></span>
        {overlayText ? <span className="mx-3 rounded text-xs">{overlayText}</span> : null}
        <span className="h-[0.5px] flex-grow rounded bg-border"></span>
      </div>
    </div>
  );
};

export { SeparatorWithText, type SeparatorWithTextProps };
