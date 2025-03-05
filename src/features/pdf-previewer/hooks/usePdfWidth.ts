import { useEffect, useState } from "react";

export const usePdfWidth = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const [width, setWidth] = useState(600); // initial width

  useEffect(() => {
    const updateWidth = () => {
      if (canvasRef.current) {
        setWidth(canvasRef.current.getBoundingClientRect().width);
      }
    };

    updateWidth(); // set initial width
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [canvasRef]);

  return { width };
};
