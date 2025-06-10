import { useEffect } from "react";

export const useScrollToTop = () => {
  const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  };

  return { scrollToTop };
};

// Hook for automatic scroll to top on component mount
export const useScrollToTopOnMount = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

// Hook for scroll to top on route change
export const useScrollToTopOnRouteChange = (location: string) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
};