"use client";

import { SummaryCount } from "@/services/dashboard/DashboardParams";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";

interface Props {
  data: SummaryCount;
}

const CATEGORY_COLORS = {
  "Due Today": "#CBD5E1",
  "Due Tomorrow": "#A855F7",
  "Past Due": "#F59E0B",
  Unread: "#EF4444",
  ToDo: "#22C55E",
};

const TasksByTimeline = ({ data }: Props) => {
  const { filters, setExclusiveFilter } = useDashboardFilters();

  const items = [
    {
      key: "DueToday" as keyof SummaryCount,
      label: "Due Today",
      color: CATEGORY_COLORS["Due Today"],
    },
    {
      key: "DueTomorrow" as keyof SummaryCount,
      label: "Due Tomorrow",
      color: CATEGORY_COLORS["Due Tomorrow"],
    },
    {
      key: "PastDue" as keyof SummaryCount,
      label: "Past Due",
      color: CATEGORY_COLORS["Past Due"],
    },
    {
      key: "Unread" as keyof SummaryCount,
      label: "Unread",
      color: CATEGORY_COLORS["Unread"],
    },
    {
      key: "TodoCount" as keyof SummaryCount,
      label: "ToDo",
      color: CATEGORY_COLORS["ToDo"],
    },
  ];

  const counts = items.map((item) => data[item.key] || 0);
  const rawMax = Math.max(...counts, 0);
  const maxValue = rawMax === 0 ? 100 : Math.ceil(rawMax / 100) * 100;

  return (
    <div className="flex flex-col gap-4 w-full px-3 pt-3">
      {items.map((item) => {
        const count = data[item.key] || 0;
        const widthPercentage = (count / maxValue) * 100;

        const isActive = filters.quickFilter === item.key;
        const isMuted = filters.quickFilter !== null && !isActive;
        return (
          <div
            key={item.key}
            onClick={() => setExclusiveFilter("quickFilter", item.key)}
            className={`flex flex-col gap-1.5 cursor-pointer group transition-all duration-200 select-none`}
            style={{ opacity: isMuted ? 0.4 : 1 }}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium transition-colors ${isActive ? "text-slate-700 font-semibold" : "text-slate-700"} group-hover:text-slate-900`}
                >
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {count}
                </span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${widthPercentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TasksByTimeline;
