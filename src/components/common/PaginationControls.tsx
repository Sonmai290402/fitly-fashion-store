"use client";

import { useCallback } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSize = 8,
  pageSizeOptions = [8, 12, 24, 48],
  showPageSize = true,
}: PaginationControlsProps) {
  const getPageNumbers = useCallback(() => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount * 2 + 3;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = siblingCount * 2 + 1;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "leftEllipsis", ...rightRange];
    }

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftRange = Array.from(
        { length: siblingCount * 2 + 1 },
        (_, i) => i + 1
      );
      return [...leftRange, "rightEllipsis", totalPages];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );

    return [1, "leftEllipsis", ...middleRange, "rightEllipsis", totalPages];
  }, [currentPage, totalPages]);

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full my-4">
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center space-x-2 self-start">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>

          <span className="ml-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              tabIndex={0}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {pageNumbers.map((pageNumber, i) => {
            if (
              pageNumber === "leftEllipsis" ||
              pageNumber === "rightEllipsis"
            ) {
              return (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={`page-${pageNumber}`}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => onPageChange(pageNumber as number)}
                  tabIndex={0}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              tabIndex={0}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
