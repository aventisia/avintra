interface SmartImageProps {
  src: string;
  type?: string;
  alt?: string;
  style?: React.CSSProperties;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, style }) => {
  return <img src={src} alt={alt || ""} style={style} />;
};

export default SmartImage;
