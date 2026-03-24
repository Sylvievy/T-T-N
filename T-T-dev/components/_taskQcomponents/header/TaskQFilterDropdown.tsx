"use client";

import { useState, useMemo } from "react";
import {
  ListFilter,
  ChevronDown,
  Search,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { cn } from "@/lib/utils";

type FilterKey = "priority" | "status" | "owner" | "assignedBy";

export const TaskQFilterDropdown = () => {
  const { filters, setFilter, resetFilters, tasks } = useTaskQ();
  const [open, setOpen] = useState(false);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const options = useMemo(
    () => ({
      priority: Array.from(
        new Set(tasks.map((t: any) => t.Priority).filter(Boolean)),
      ),
      status: Array.from(
        new Set(tasks.map((t: any) => t.StatusName).filter(Boolean)),
      ),
      owner: Array.from(
        new Set(tasks.map((t: any) => t.CurrentOwner).filter(Boolean)),
      ),
      assignedBy: Array.from(
        new Set(tasks.map((t: any) => t.AssignedBy).filter(Boolean)),
      ),
    }),
    [tasks],
  );

  const filterFields: { label: string; key: FilterKey; options: string[] }[] = [
    { label: "Priority", key: "priority", options: options.priority },
    { label: "Status", key: "status", options: options.status },
    { label: "Current Owner", key: "owner", options: options.owner },
    { label: "Assigned By", key: "assignedBy", options: options.assignedBy },
  ];

  const hasAnyFilter = filterFields.some(
    (f) => (filters[f.key] as string[]).length > 0,
  );

  const handleToggleFilter = (key: FilterKey, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilter(key, updated);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-slate-700 hover:bg-slate-200 transition-all",
            hasAnyFilter
              ? "bg-[#e8efe9] text-[#a3bfaa]hover:bg-green-200"
              : "text-slate-700 hover:bg-slate-200",
          )}
        >
          <ListFilter className="w-4 h-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 px-3 py-2 bg-[#fdfdfd] shadow-xl border-slate-200 rounded-xl"
        align="end"
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {filterFields.map((field) => {
            const selected = (filters[field.key] as string[]) || [];
            const hasValue = selected.length > 0;
            const searchTerm = searchTerms[field.key] || "";
            const filteredOptions = field.options.filter((opt) =>
              opt.toLowerCase().includes(searchTerm.toLowerCase()),
            );

            return (
              <div key={field.key} className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-slate-700 px-0.5">
                  {field.label}
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-6 w-full flex items-center justify-between px-2 text-[11px] font-medium border-slate-200 rounded-lg hover:border-blue-400 transition-all",
                        hasValue
                          ? "text-[#30493b] border-[#30493b] bg-[#e8efe9]"
                          : "text-slate-700",
                      )}
                    >
                      <span className="truncate max-w-[80px]">
                        {hasValue ? selected.join(", ") : "All"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 opacity-30",
                          hasValue && "text-[#30493b] opacity-100",
                        )}
                      />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[190px] p-0 bg-white shadow-2xl border-slate-200 rounded-xl overflow-hidden"
                    side="bottom"
                    align="start"
                  >
                    <div className="flex items-center px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/50">
                      <Search size={10} className="text-slate-400 mr-2" />
                      <input
                        placeholder="Search..."
                        className="flex-1 bg-transparent border-none text-xs focus:outline-none placeholder:text-slate-700"
                        value={searchTerm}
                        onChange={(e) =>
                          setSearchTerms({
                            ...searchTerms,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    </div>

                    <ScrollArea className="max-h-[200px]">
                      <div className="p-1 space-y-0.5">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                              <div
                                key={opt}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-[#e8efe9]"
                                    : "hover:bg-slate-50",
                                )}
                                onClick={() =>
                                  handleToggleFilter(field.key, opt)
                                }
                              >
                                <div
                                  className={cn(
                                    "flex items-center justify-center h-3.5 w-3.5 rounded border transition-all",
                                    isChecked
                                      ? "bg-[#30493b] border-[#30493b]"
                                      : "border-slate-300",
                                  )}
                                >
                                  {isChecked && (
                                    <Check
                                      size={8}
                                      className="text-white stroke-[4px]"
                                    />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-[10px] flex-1 truncate",
                                    isChecked
                                      ? "text-[#30493b] font-bold"
                                      : "text-slate-600",
                                  )}
                                >
                                  {opt}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-4 text-center text-xs text-slate-700">
                            No results
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
