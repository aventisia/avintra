import { useState, useEffect } from "react";

/**
 * Custom hook that observes a parent element's width and returns it
 * @param {React.RefObject} parentRef - Ref object for the parent element
 * @returns {number} The current width of the parent element
 */
export const useParentWidth = (parentRef: React.RefObject<HTMLDivElement>) => {
  const [width, setWidth] = useState<number>(800);

  useEffect(() => {
    if (!parentRef.current) return;

    // Function to measure and update width
    const updateWidth = () => {
      if (parentRef.current) {
        const newWidth = parentRef.current.offsetWidth;
        setWidth(newWidth);
      }
    };

    // Initial measurement
    updateWidth();

    // Create resize observer to track width changes
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    // Start observing the parent element
    resizeObserver.observe(parentRef.current);

    // Clean up the observer when component unmounts
    return () => {
      resizeObserver.disconnect();
    };
  }, [parentRef]);

  return {width};
};
