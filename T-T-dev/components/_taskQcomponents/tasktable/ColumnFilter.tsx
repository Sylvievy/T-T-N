import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, ArrowUp, ArrowDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const OPERATORS = ["Contains", "Is", "Starts with", "Ends with"];

export const ColumnFilter = ({
  column,
  title,
  currentFilter,
  onFilterChange,
  onSort,
  sortOrder,
  isSorted,
}: any) => {
  const [operator, setOperator] = useState("Contains");

  const isTitleColumn = column === "TaskTitle";

  return (
    <div className="flex items-center w-full group gap-1">
      {/* 1. LABEL & SORT */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSort(sortOrder === "asc" ? "desc" : "asc");
        }}
        className="flex-1 flex items-center gap-1 text-left hover:text-slate-900 transition-colors"
      >
        <span className="truncate">{title}</span>
        {isSorted && (
          <span className="text-[#30493b] shrink-0">
            {sortOrder === "asc" ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )}
          </span>
        )}
      </button>

      {/* 2. FILTER POPOVER */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "p-1 rounded hover:bg-slate-200/50 transition-all outline-none",
              currentFilter
                ? "opacity-100 text-[#30493b]"
                : "opacity-0 group-hover:opacity-100 text-slate-400",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Filter size={12} fill={currentFilter ? "currentColor" : "none"} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-56 p-2 rounded-lg shadow-xl border-slate-200 bg-white z-50"
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium  text-slate-700 tracking-tight">
                Filter {title}
              </span>
              {currentFilter && (
                <button
                  onClick={() => onFilterChange("")}
                  className="text-xs text-[#30493b]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              {isTitleColumn && (
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger className="h-7 text-[11px] border-none bg-slate-50 shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op} value={op} className="text-[11px]">
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={currentFilter || ""}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="h-6 text-xs border-slate-200 rounded focus-visible:ring-[#30493b]"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
