"use client";

import { useState, useMemo } from "react";
import { ListFilter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";
import {
  TypePriority,
  TaskStatus,
  ByUsers,
} from "@/services/dashboard/DashboardParams";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  typePriority: TypePriority[];
  taskStatus: TaskStatus[];
  tasksByUsers: ByUsers[];
}

export const FilterDropdown = ({
  typePriority = [],
  taskStatus = [],
  tasksByUsers = [],
}: FilterDropdownProps) => {
  const { filters, setFilter, resetFilters } = useDashboardFilters();
  const [open, setOpen] = useState(false);

  const masterOptions = useMemo(
    () => ({
      importance: Array.from(
        new Set(typePriority?.map((tp) => tp.Priority) || []),
      ),
      status: Array.from(new Set(taskStatus?.map((ts) => ts.StatusName) || [])),
      category: Array.from(
        new Set(typePriority?.map((tp) => tp.TaskType) || []),
      ),
      users: Array.from(new Set(tasksByUsers?.map((u) => u.UserName) || [])),
    }),
    [typePriority, taskStatus, tasksByUsers],
  );

  const filterFields = [
    { label: "Priority", key: "priority", options: masterOptions.importance },
    { label: "Status", key: "status", options: masterOptions.status },
    { label: "Category", key: "type", options: masterOptions.category },
    {
      label: "Assigned Owner",
      key: "assignedBy",
      options: masterOptions.users,
    },
    // { label: "Next Owner", key: "user", options: masterOptions.users },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-slate-500 hover:text-slate-700"
        >
          <ListFilter className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 px-3 py-2 bg-[#fdfdfd] shadow-xl border-slate-200"
        align="end"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {filterFields.map((field) => {
            const currentValue = filters[field.key as keyof typeof filters];
            const hasValue = !!currentValue;
            const getDisplayText = (val: any) => {
              if (!val) return "Select";
              if (typeof val === "object" && val.from) {
                // Format date range for display
                const from = new Date(val.from).toLocaleDateString("en-IN");
                const to = val.to
                  ? new Date(val.to).toLocaleDateString("en-IN")
                  : "";
                return `${from} - ${to}`;
              }
              return String(val);
            };
            return (
              <div key={field.key} className="flex flex-col space-y-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {field.label}
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-6 w-full flex items-center justify-between px-2 text-xs font-normal border-slate-200 hover:bg-white hover:border-blue-400 transition-colors",
                        hasValue
                          ? "text-slate-900 border-blue-200 bg-blue-50/30"
                          : "text-slate-400",
                      )}
                    >
                      <span className="truncate">
                        {getDisplayText(currentValue)}{" "}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 opacity-80",
                          hasValue && "text-blue-500",
                        )}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[180px] p-2 bg-[#fdfdfd]"
                    side="bottom"
                    align="start"
                  >
                    <ScrollArea className="h-fit custom-scrollbar custom-scrollbar-hide max-h-[200px] overflow-y-auto">
                      <div className="space-y-1 ">
                        {field.options.map((opt) => (
                          <div
                            key={opt}
                            className="flex items-center hover:bg-slate-50 border-b-2 gap-2 p-1 rounded-sm cursor-pointer group"
                            onClick={() => setFilter(field.key as any, opt)}
                          >
                            <Checkbox
                              id={`${field.key}-${opt}`}
                              className="h-3.5 w-3.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              checked={currentValue === opt}
                              onCheckedChange={() =>
                                setFilter(field.key as any, opt)
                              }
                            />
                            <label
                              htmlFor={`${field.key}-${opt}`}
                              className={cn(
                                "text-xs cursor-pointer flex-1 transition-colors",
                                currentValue === opt
                                  ? "text-blue-600 font-medium"
                                  : "text-slate-600",
                              )}
                            >
                              {opt}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end items-center pt-2 mt-4 border-t">
          <Button
            onClick={() => {
              resetFilters();
              setOpen(false);
            }}
            className="bg-[#FF8008] hover:bg-[#FF8008]/90 text-white text-[11px] h-8 px-8 rounded-md shadow-md font-bold"
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
