import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TaskPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: TaskPaginationProps) => {
  return (
    <div className="flex items-center justify-between px-4 p  y-0 h-5 rounded-md  ">
      <span className="text-[10px] text-slate-500 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 hover:text-slate-700" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4 text-slate-500 hover:text-slate-700" />
        </Button>
      </div>
    </div>
  );
};
