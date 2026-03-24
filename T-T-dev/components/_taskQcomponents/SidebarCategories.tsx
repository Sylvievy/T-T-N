// SidebarCategories.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Tag, X, Search } from "lucide-react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const SidebarCategories = () => {
  const { derivedCategoryCounts, filters, setFilter } = useTaskQ();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = filters.category;

  const filteredCategories = useMemo(() => {
    return derivedCategoryCounts.filter((cat) =>
      cat.TaskType.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [derivedCategoryCounts, searchQuery]);

  const handleCategoryClick = (categoryName: string) => {
    if (activeCategory === categoryName) {
      setFilter("category", null);
    } else {
      setFilter("category", categoryName);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 py-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 flex items-center justify-between text-slate-700 font-semibold text-sm hover:text-slate-700 transition-colors shrink-0"
      >
        <span>Categories ({filteredCategories.length})</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* SEARCH BOX */}
          <div className="px-4 py-1 shrink-0">
            <div className="relative">
              <Input
                placeholder="Search ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 w-full font-xs bg-[#fdfdfd] border-slate-200 focus-visible:ring-[#30493b]"
              />
            </div>
          </div>

          {/* SCROLLABLE AREA */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar pb-4">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isActive = activeCategory === cat.TaskType;
                return (
                  <button
                    key={cat.TaskType}
                    onClick={() => handleCategoryClick(cat.TaskType)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 px-4 rounded-lg transition-all group",
                      isActive
                        ? "bg-[#a3bfaa] text-[#30493b] shadow-sm font-bold"
                        : "hover:bg-slate-200 text-slate-700",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Tag
                        size={12}
                        className={cn(
                          "rotate-90",
                          isActive
                            ? "text-[#30493b]"
                            : "text-slate-700 group-hover:text-[#30493b]",
                        )}
                      />
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {cat.TaskType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {cat.TaskCount}
                      </span>
                      {isActive && <X size={10} className="text-[#30493b]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 italic">
                No categories found
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};
