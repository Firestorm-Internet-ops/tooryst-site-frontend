import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  onceOnly?: boolean;
}

export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const { onceOnly = true, threshold = 0.1, ...observerOptions } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (onceOnly && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!onceOnly) {
        setIsVisible(false);
      }
    }, { threshold, ...observerOptions });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onceOnly, threshold, observerOptions]);

  return [ref, isVisible];
}
