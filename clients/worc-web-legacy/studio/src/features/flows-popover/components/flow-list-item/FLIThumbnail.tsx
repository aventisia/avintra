/**
 * Renders a thumbnail for a flow.
 */
export const FLIThumbnail = () => {
  return (
    <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md">
      <img
        alt="template"
        loading="lazy"
        decoding="async"
        className="aspect-square object-cover transition-all"
        src={import.meta.env.BASE_URL + "sample-img_placeholder.jpg"}
      />
    </div>
  );
};
