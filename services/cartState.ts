import { useState, useEffect } from 'react';

let globalCartCount = 0;
const listeners = new Set<(count: number) => void>();

// Call this to update the badge count globally
export const updateGlobalCartCount = (count: number) => {
  globalCartCount = count;
  listeners.forEach(listener => listener(count));
};

// Custom React Hook to subscribe to the global count dynamically
export const useCartCount = () => {
  const [count, setCount] = useState(globalCartCount);
  
  useEffect(() => {
    listeners.add(setCount);
    return () => {
      listeners.delete(setCount);
    };
  }, []);
  
  return count;
};