// This logic was adapted from this devto post https://dev.to/brdnicolas/click-outside-magic-a-new-custom-hook-4np4

import { useEffect, type RefObject } from 'react';

// Custom hook to detect clicks/touches outside a referenced element
export const useClickOutside = (
  ref: RefObject<HTMLDivElement | null>,
  handleOnClickOutside: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    // Event listener for mouse and touch events
    const listener = (event: MouseEvent | TouchEvent) => {
      // If ref is not set or the click is inside the element, do nothing
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // Otherwise, call the provided callback
      handleOnClickOutside(event);
    };
    // Listen for mouse and touch events on the whole document
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    // Cleanup: remove listeners when effect dependencies change or component unmounts
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handleOnClickOutside]);
}