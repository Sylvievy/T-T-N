"use client";

import { SummaryCount } from "@/services/dashboard/DashboardParams";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";

interface TaskStatsProps {
  summary: SummaryCount;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

interface StatItem {
  id: keyof SummaryCount;
  label: string;
  color: string;
}

export const TaskStats = ({ summary, onTabChange }: TaskStatsProps) => {
  const { filters, setExclusiveFilter } = useDashboardFilters();

  const stats: StatItem[] = [
    { id: "DueToday", label: "Due Today", color: "text-slate-800" },
    { id: "Unread", label: "Unread", color: "text-slate-800" },
    { id: "PastDue", label: "Past Due", color: "text-red-600" },
    { id: "TodoCount", label: "To Do", color: "text-slate-800" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((tab) => {
        const isActive = filters.quickFilter === tab.id;
        const count = summary ? summary[tab.id] : "0";

        return (
          <div
            key={tab.id}
            onClick={() => {
              setExclusiveFilter("quickFilter", tab.id);
              if (onTabChange) onTabChange(tab.id);
            }}
            style={{ cursor: "pointer" }}
            className={`flex flex-col border rounded-xl shrink-0 overflow-x-auto shadow-sm transition-all
              ${isActive ? "border-[#30493b] ring-1 ring-[#30493b]" : "border-slate-200 hover:border-green-900"}`}
          >
            <div className="flex-1 flex items-center justify-center p-0 bg-[#fdfdfd]">
              <span className={`text-md font-bold ${tab.color}`}>
                {count || 0}
              </span>
            </div>
            <div className="bg-[#30493b] p-0.5 flex-1 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {tab.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
