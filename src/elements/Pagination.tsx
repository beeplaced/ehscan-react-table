import { useState, useEffect } from "react";
import PaginationButton from "./PaginationButton";
import styles from './table.module.css';

interface Props {
  totalItems: number;               // total number of rows/items
  currentEntries: number;           // how many entries currently shown
  limit: number;                    // items per page
  skip: number;                     // offset
  currentPage: number;              // current page index
  onPageChange: (page: number) => void; // callback when page changes
}

export const Pagination: React.FC<Props> = ({
  totalItems,
  currentEntries,
  limit,
  skip,
  currentPage,
  onPageChange }) => {

  const [totalPages, setTotalPages] = useState(0);

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
  console.log(page)
    onPageChange(page);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / limit))
  }, [totalItems]);

  const getVisiblePages = (currentPage: number, totalPages: number, maxVisible = 10) => {
    const pages = [];
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 5) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }
    if (currentPage >= totalPages - 4) {
      pages.push(1, 2, 3, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages
    );

    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const PaginationOutput = () => {
    const from = skip + 1;
    const to = currentEntries > totalItems ? totalItems : currentEntries;
    if (skip === undefined || currentEntries === undefined || totalItems === undefined) return null;
    return <div className={styles.paginationend}>{from} - {to} / {totalItems}</div>
  }

  return (
    <>
      <div className={styles.paginationwrapper}>
        {totalPages > 1 && (
          <>
          <PaginationButton index={'prev'} action={handlePrevious} display={totalPages > 2 && currentPage > 1} />
            {visiblePages.map((p, i) => {
              const isEllipsis = p === "...";
              return (
                <PaginationButton
                  key={i}
                  txt={p}
                  isActive={p === currentPage}
                  disabled={isEllipsis}
                  action={isEllipsis ? undefined : () => handlePageClick(p as number)}
                />
              );
            })}
            <PaginationButton index={'next'} action={handleNext} display={totalPages > 2 && currentPage !== totalPages} />
          </>
        )}
      </div>
      <PaginationOutput />
    </>
  );
};