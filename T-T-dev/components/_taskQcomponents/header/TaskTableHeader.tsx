"use client";

import React, { useState } from "react";
import {
  Layout as LayoutIcon,
  ListFilter,
  Columns,
  Rows,
  Maximize2,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ExportTaskQList from "./ExportTaskQList";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { TaskQFilterDropdown } from "./TaskQFilterDropdown";
import { TaskQGroupDropdown } from "./TaskQGroupDropdown";

export const TaskTableHeader = ({
  onLayoutChange,
}: {
  onLayoutChange: (type: any) => void;
}) => {
  const { layoutType, searchQuery, setSearchQuery, loading } = useTaskQ();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const isLayoutModified = layoutType !== "right";

  return (
    <TooltipProvider delayDuration={100}>
      <header className="flex items-center rounded-md justify-between h-10 p-1 bg-[#fdfdfd] z-20">
        <div className="flex items-center px-1 gap-4 flex-1">
          {/* Search Bar Group */}
          <div className="flex items-center gap-1 w-1/3">
            <div className="relative flex-1 bg-[#fdfdfd] border border-slate-200 rounded-lg group focus-within:ring-1 focus-within:ring-green-900/30">
              <input
                type="search"
                placeholder="Search tasks..."
                className="w-full bg-transparent rounded-md p-1.5 px-3 text-xs focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <TaskQFilterDropdown />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Filter Tasks</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <TaskQGroupDropdown />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Group By</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 transition-all",
                            // ADD THIS LOGIC:
                            isLayoutModified
                              ? "bg-[#e8efe9] text-[#a3bfaa]hover:bg-green-200"
                              : "text-slate-600 hover:bg-slate-200",
                          )}
                        >
                          <LayoutIcon size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuSeparator />
                        {[
                          { id: "list", label: "List View", icon: ListFilter },
                          {
                            id: "right",
                            label: "Right Reading Pane",
                            icon: Columns,
                          },
                          {
                            id: "bottom",
                            label: "Bottom Reading Pane",
                            icon: Rows,
                          },
                        ].map((item) => (
                          <DropdownMenuItem
                            key={item.id}
                            onClick={() => onLayoutChange(item.id as any)}
                            className="flex justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <item.icon size={16} /> {item.label}
                            </div>
                            {layoutType === item.id && (
                              <Check size={14} className="text-blue-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Change Layout</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Right side: Timestamp and Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-[10px] leading-tight text-slate-400 font-medium">
            <span>Last updated</span>
            <span>{format(lastUpdated, "dd MMM, hh:mm a")}</span>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || loading}
                  className="text-slate-600 hover:bg-slate-200 h-8 w-8 p-0"
                >
                  <RefreshCw
                    size={15}
                    className={cn(
                      "transition-all",
                      (isRefreshing || loading) &&
                        "animate-spin text-green-700",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ExportTaskQList />
                </div>
              </TooltipTrigger>
              <TooltipContent>Export List</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
