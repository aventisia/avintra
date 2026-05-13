import { useEffect, useState } from "react";

/**
 * Custom hook that observes a parent element's width and returns it with an optional offset
 * @param {React.RefObject} parentRef - Ref object for the parent element
 * @param {number} offset - An optional offset to adjust the observed width
 * @returns {number} The current width of the parent element with the applied offset
 */
export const useParentWidth = (
  parentRef: React.RefObject<HTMLDivElement>,
  offset: number = 0, // Default offset is 0
) => {
  const [width, setWidth] = useState<number>(800);

  useEffect(() => {
    if (!parentRef.current) return;

    // Function to measure and update width
    const updateWidth = () => {
      if (parentRef.current) {
        const newWidth = parentRef.current.offsetWidth - offset;
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
  }, [offset, parentRef]);

  return { width };
};
