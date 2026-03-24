import { Search, ArrowUpDown, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "./FilterDropdown";
import { SortDropdown } from "./SortDropdown";
import { useState, useEffect } from "react";
import {
  TypePriority,
  TaskStatus,
  ByUsers,
} from "@/services/dashboard/DashboardParams";

interface TaskToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onReset: () => void;
  typePriority: TypePriority[];
  taskStatus: TaskStatus[];
  tasksByUsers: ByUsers[];
}

export const TaskToolbar = ({
  search,
  onSearchChange,
  onReset,
  typePriority,
  taskStatus,
  tasksByUsers,
}: TaskToolbarProps) => {
  const [localSearch, setLocalSearch] = useState(search || "");

  useEffect(() => {
    const nextSearch = search || "";
    if (nextSearch !== localSearch) {
      setLocalSearch(nextSearch);
    }
  }, [search]);

  useEffect(() => {
    if (localSearch === (search || "")) return;

    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 h-6 px-2 bg-[#fdfdfd] border border-slate-200 rounded-md group focus-within:ring-1 focus-within:ring-blue-400 transition-all relative">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={localSearch || ""}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search tasks..."
          className="text-xs w-full focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent pr-5"
        />

        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-2.5 h-2.5 text-slate-400 hover:text-red-500" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <SortDropdown />
        <FilterDropdown
          typePriority={typePriority}
          taskStatus={taskStatus}
          tasksByUsers={tasksByUsers}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="h-5 w-5 text-slate-500 hover:text-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
