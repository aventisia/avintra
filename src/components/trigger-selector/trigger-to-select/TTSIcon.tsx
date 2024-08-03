export const TTSIcon = ({ iconSrc }: { iconSrc: string }) => {
  return (
    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md">
      <img
        alt="template"
        loading="lazy"
        decoding="async"
        className="aspect-square h-5 object-cover transition-all"
        src={iconSrc}
      />
    </div>
  );
};
