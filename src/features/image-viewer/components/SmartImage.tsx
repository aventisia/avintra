interface SmartImageProps {
  src: string;
  type?: string;
  alt?: string;
  style?: React.CSSProperties;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, type, alt, style }) => {
  if (type === "SVG") {
    return (
      <object type="image/svg+xml" data={src} style={style}>
        {/* Optional fallback */}
        {alt || "SVG not supported"}
      </object>
    );
  }

  return <img src={src} alt={alt || ""} style={style} />;
};

export default SmartImage;
