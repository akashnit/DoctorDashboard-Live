import { useState, useEffect } from "react";

const usePagination = (data = [], itemsPerPage = 3) => {
  const [page, setPage] = useState(0);

  const maxPage = Math.ceil(data.length / itemsPerPage) - 1;

  const currentData = data.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const next = () => {
    if (page < maxPage) setPage((prev) => prev + 1);
  };

  const prev = () => {
    if (page > 0) setPage((prev) => prev - 1);
  };

  // Optional: reset pagination when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

  return {
    currentData,
    next,
    prev,
    page,
    maxPage,
  };
};

export default usePagination;
