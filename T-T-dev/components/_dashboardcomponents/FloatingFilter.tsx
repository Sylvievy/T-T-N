"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw } from "lucide-react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { cn } from "@/lib/utils";

export const FilterState = () => {
  const { filters, setFilter, setColumnFilter, resetFilters } = useTaskQ();

  const activeGeneral = Object.entries(filters).filter(
    ([key, value]) =>
      ["priority", "status", "owner", "assignedBy", "category"].includes(key) &&
      value !== null,
  );

  const activeColumns = Object.entries(filters.columnFilters).filter(
    ([_, value]) => value !== "",
  );

  const groupingActive =
    filters.groupBy !== "Date" ? [["groupBy", filters.groupBy]] : [];

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
            className="relative flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
          >
            <Filter className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center border border-white font-bold">
              {allActiveFilters.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-3 shadow-xl bg-white border-slate-200"
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
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Reset all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allActiveFilters.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5 py-0.5 px-2 text-[10px] border font-medium",
                  key === "groupBy"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : filters.columnFilters[key] !== undefined
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-slate-100 border-slate-200 text-slate-700",
                )}
              >
                <span className="opacity-70 text-[9px]">
                  {key === "groupBy" ? "Group" : key}:
                </span>
                <span className="truncate max-w-[80px]">{String(value)}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => {
                    if (key === "groupBy") setFilter("groupBy", "Date");
                    else if (key === "search") {
                      setFilter("search", "");
                    } else if (filters.columnFilters[key] !== undefined)
                      setColumnFilter(key, "");
                    else setFilter(key, null);
                  }}
                />
              </Badge>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
