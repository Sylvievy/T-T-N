"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownNarrowWideIcon,
  ArrowUpNarrowWideIcon,
} from "lucide-react";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  sortOrder: "desc" | "asc";
  onSortToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const UserPagination = ({
  currentPage,
  totalPages,
  sortOrder,
  onSortToggle,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: UserPaginationProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-1 border-t">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-slate-500 hover:text-slate-700"
          onClick={onSortToggle}
          title={
            sortOrder === "desc" ? "Sort: Low to High" : "Sort: High to Low"
          }
        >
          {sortOrder === "desc" ? (
            <ArrowDownNarrowWideIcon className="h-4 w-4" />
          ) : (
            <ArrowUpNarrowWideIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-[11px] text-slate-500 font-medium">
        Page {currentPage + 1} of {totalPages}
      </p>

      <div className="flex items-center gap-2 text-slate-500">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onPrev}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4 hover:text-slate-700" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onNext}
          disabled={!canNext}
        >
          <ChevronRight className="h-4 w-4 hover:text-slate-700" />
        </Button>
      </div>
    </div>
  );
};
