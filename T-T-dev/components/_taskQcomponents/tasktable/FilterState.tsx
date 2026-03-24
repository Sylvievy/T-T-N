"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { cn } from "@/lib/utils";

export const FilterState = () => {
  const { filters, setFilter, setColumnFilter, resetFilters } = useTaskQ();

  const activeGeneral = Object.entries(filters).filter(
    ([key, value]) =>
      ["priority", "status", "owner", "assignedBy"].includes(key) &&
      Array.isArray(value) &&
      value.length > 0,
  );

  if (filters.category) {
    activeGeneral.push(["category", filters.category]);
  }

  const activeColumns = Object.entries(filters.columnFilters).filter(
    ([_, value]) => value !== "",
  );

  const groupingActive =
    filters.groupBy !== "None" ? [["groupBy", filters.groupBy]] : [];

  const allActiveFilters = [
    ...groupingActive,
    ...activeGeneral,
    ...activeColumns,
  ];

  if (allActiveFilters.length === 0) return null;

  return (
    <div className="flex items-center shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 hover:bg-[#e8efe9] border border-[#30493b] transition-all shadow-sm"
          >
            <Filter className="h-3.5 w-3.5 text-[#30493b] fill-[#a3bfaa]" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center border border-white font-bold">
              {allActiveFilters.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-3 shadow-xl bg-white border-slate-200 z-50 rounded-xl"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between mb-2 pb-2 border-b">
            <h4 className="font-semibold text-xs text-slate-700">
              Active Filters
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-5 w-5 p-0 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allActiveFilters.map(([key, value]) => {
              const isColumnFilter = filters.columnFilters[key] !== undefined;
              const isGrouping = key === "groupBy";

              const displayValue = Array.isArray(value)
                ? value.length > 1
                  ? `${value.length} selected`
                  : value[0]
                : String(value);

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1.5 py-0.5 px-2 text-[10px] border font-medium rounded-md",
                    isGrouping
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : isColumnFilter
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-blue-50 border-blue-100 text-blue-700",
                  )}
                >
                  <span className="opacity-70 text-[9px] capitalize">
                    {isGrouping ? "Group" : key.replace(/([A-Z])/g, " $1")}:
                  </span>
                  <span className="truncate max-w-[100px]">{displayValue}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                    onClick={() => {
                      if (isGrouping) {
                        setFilter("groupBy", "Date");
                      } else if (isColumnFilter) {
                        setColumnFilter(key, "");
                      } else {
                        setFilter(key, []);
                      }
                    }}
                  />
                </Badge>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
