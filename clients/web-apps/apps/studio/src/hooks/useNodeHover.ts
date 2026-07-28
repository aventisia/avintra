import { useCallback, useEffect, useRef, useState } from "react";

export function useNodeHover(delay: number = 150) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, delay);
  }, [delay]);

  // Clean up the timeout if the component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return { isHovered, onMouseEnter, onMouseLeave };
}
