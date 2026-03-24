"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTaskQ } from "@/services/taskQ/TaskQContext";

export const TaskQGroupDropdown = () => {
  const { filters, setFilter } = useTaskQ();
  const [open, setOpen] = useState(false);

  const currentGroupBy = filters.groupBy || "Date";

  const isGroupActive = currentGroupBy !== "None";

  const groupOptions = [
    { label: "None", key: "None" },
    { label: "Date", key: "Date" },
    { label: "Importance", key: "Importance" },
    { label: "Status", key: "Status" },
    { label: "Category", key: "Category" },
    // { label: "Created By", key: "Created By" },
    { label: "Assigned By", key: "Assigned By" },
    { label: "Current Owner", key: "Current Owner" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2  h-8 w-8 transition-all active:scale-95 border",
            // ACTIVE STATE STYLES
            isGroupActive
              ? "bg-[#e8efe9] text-[#a3bfaa]hover:bg-green-200"
              : "text-slate-700 border-transparent hover:border-slate-200",
          )}
        >
          <LayoutGrid className="w-4 h-4  text-slate-700 hover:text-slate-700" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-52 p-1 bg-white shadow-2xl border-slate-200 rounded-lg"
        align="start"
      >
        <div className="flex flex-col gap-0.5">
          {groupOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                setFilter("groupBy", option.key);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center px-3 py-2 text-xs rounded-md transition-colors",
                currentGroupBy === option.key
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {option.label}
              {currentGroupBy === option.key && (
                <div className="ml-auto w-1.5 h-1.5 bg-green-700 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
