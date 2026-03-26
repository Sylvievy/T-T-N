"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";

export const SortDropdown = () => {
  const { filters, setFilter } = useDashboardFilters();
  const [open, setOpen] = useState(false);

  const currentSortBy = filters.sortBy;
  const currentOrder = filters.sortOrder || "desc";

  const sortOptions = [
    { label: "Date", key: "TaskDueDate" },
    { label: "Task Name", key: "TaskTitle" },
    { label: "Category", key: "TaskType" },
    { label: "Priority", key: "Priority" },
    { label: "Assigned By", key: "AssignedBy" },
    { label: "Current Owner", key: "CurrentOwner" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-slate-500 hover:text-slate-700"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-48 p-0 bg-white shadow-xl border-slate-200"
        align="end"
      >
        <div className="flex flex-col">
          {/* Header with Integrated Order Toggles */}
          <div className="px-3 py-2 flex items-center justify-between bg-slate-50/50 border-b">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sort by
            </span>
            <div className="flex items-center gap-1 bg-white border rounded-md p-0.5">
              <button
                onClick={() => setFilter("sortOrder", "asc")}
                className={cn(
                  "p-1 rounded-sm transition-colors",
                  currentOrder === "asc"
                    ? "bg-blue-100 text-blue-600"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => setFilter("sortOrder", "desc")}
                className={cn(
                  "p-1 rounded-sm transition-colors",
                  currentOrder === "desc"
                    ? "bg-blue-100 text-blue-600"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Field Selection */}
          <div className="p-1">
            <button
              onClick={() => setFilter("sortBy", null)}
              className="w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-sm transition-colors"
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full border flex items-center justify-center transition-all",
                  !currentSortBy
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300",
                )}
              >
                {!currentSortBy && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </div>
              <span
                className={cn(!currentSortBy && "font-medium text-slate-900")}
              >
                Default
              </span>
            </button>
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter("sortBy", option.key)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-sm transition-colors"
              >
                <div className="flex items-center gap-2 ">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full border flex items-center justify-center transition-all",
                      currentSortBy === option.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300",
                    )}
                  >
                    {currentSortBy === option.key && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <span
                    className={cn(
                      currentSortBy === option.key &&
                        "font-medium text-slate-900",
                    )}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
