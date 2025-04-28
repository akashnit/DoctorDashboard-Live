// src/hooks/useInfiniteScroll.js
import { useState, useEffect } from "react";

const useInfiniteScroll = (data = [], initialCount = 3, increment = 3, offset = 100) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const slicedData = data.slice(0, visibleCount);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - offset;

      if (isBottom && visibleCount < data.length) {
        setVisibleCount((prev) => Math.min(prev + increment, data.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, data.length]);

  return slicedData;
};

export default useInfiniteScroll;
