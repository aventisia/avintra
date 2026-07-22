import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A React functional component that renders an image element for a logo.
 * This component uses `React.forwardRef` to forward the ref to the underlying
 * `<img>` element, allowing parent components to directly interact with it.
 *
 * @typeParam HTMLImageElement - The type of the forwarded ref, which is an HTML image element.
 * @typeParam React.ImgHTMLAttributes<HTMLImageElement> - The props type, which includes all standard
 * image attributes supported by React.
 *
 * @param {Object} props - The props for the component.
 * @param {string} [props.className] - Additional CSS classes to apply to the image element.
 * @param {React.Ref<HTMLImageElement>} ref - A ref to the underlying `<img>` element.
 *
 * @returns {JSX.Element} The rendered `<img>` element with the provided props and forwarded ref.
 */
const LogoImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => {
    return <img ref={ref} alt="Logo" className={cn("h-6", className)} {...props} />;
  },
);

LogoImage.displayName = "LogoImage";

export { LogoImage };
