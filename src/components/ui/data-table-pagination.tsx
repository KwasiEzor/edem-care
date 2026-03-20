"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-muted-custom">
        {start}–{end} sur {totalItems} résultats
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 5) return true;
            if (page === 1 || page === totalPages) return true;
            return Math.abs(page - currentPage) <= 1;
          })
          .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
            if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
              acc.push("ellipsis");
            }
            acc.push(page);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "ellipsis" ? (
              <span key={`e-${idx}`} className="px-1 text-muted-custom">
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant={item === currentPage ? "default" : "outline"}
                size="icon-sm"
                className={
                  item === currentPage ? "bg-forest text-white" : ""
                }
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            )
          )}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
