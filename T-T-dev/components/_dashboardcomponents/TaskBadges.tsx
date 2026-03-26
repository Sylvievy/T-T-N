import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import {
  SummaryCount,
  TypePriority,
} from "@/services/dashboard/DashboardParams";
import React, { useRef } from "react";
import { TaskLog } from "@/services/GlobalParams";

const PRIORITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string; active: string }
> = {
  Critical: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    active: "bg-red-600 text-white border-red-600",
  },
  High: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    active: "bg-orange-600 text-white border-orange-600",
  },
  Medium: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    active: "bg-blue-600 text-white border-blue-600",
  },
  Low: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
    active: "bg-green-600 text-white border-green-600",
  },
};

interface PriorityBadgesProps {
  filters: any;
  setFilter: (key: any, value: any) => void;
  summary: SummaryCount;
  typePriority: TypePriority[];
  taskLog: TaskLog[];
  filteredCount: number;
}

export const TaskBadges = ({
  filters,
  setFilter,
  summary,
  typePriority,
  taskLog = [],
  filteredCount,
}: PriorityBadgesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };
  const loggedInUserId =
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_user_id")
      : null;
  const loggedInUserName =
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_user_name")
      : null;

  const badges = [
    {
      id: "All",
      label: "All Tasks",
      activeStyle: "bg-[#30493b] text-white border-slate-800",
    },
    {
      id: "myTasks",
      label: "My Tasks",
      activeStyle: "bg-[#30493b] text-white border-blue-600",
    },
    {
      id: "assignedByMe",
      label: "Assigned by me",
      activeStyle: "bg-[#30493b] text-white border-blue-600",
    },
    { id: "Critical", label: "Critical" },
    { id: "High", label: "High" },
    { id: "Medium", label: "Medium" },
    { id: "Low", label: "Low" },
  ];

  return (
    <div className="relative group flex items-center w-full">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ChevronLeft size={16} className="text-slate-500" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex flex-row shrink-0 gap-1">
          <Star className="bg-yellow-50 text-yellow-600 shrink-0 border-yellow-100 px-1.5 py-1 rounded-full border cursor-pointer transition-all hover:bg-yellow-100 hover:fill-yellow-600" />

          {badges.map((badge) => {
            const isOwnership =
              badge.id === "myTasks" || badge.id === "assignedByMe";
            const isAll = badge.id === "All";
            const isActive = isAll
              ? !filters.tab && !filters.priority
              : isOwnership
                ? filters.tab === badge.id
                : filters.priority === badge.id;

            let count = 0;
            if (isAll) {
              const isAnyFilterActive =
                filters.user ||
                filters.type ||
                filters.priority ||
                filters.status ||
                filters.search;
              count = isAnyFilterActive ? filteredCount : taskLog.length;
            } else if (badge.id === "myTasks") {
              count = taskLog.filter((t) => t.myTasks !== 1).length;
            } else if (badge.id === "assignedByMe") {
              count = taskLog.filter((t) => t.assignedByMe !== 1).length;
            } else if (!isOwnership) {
              count = typePriority.filter(
                (tp) => tp.Priority === badge.id,
              ).length;
            }

            const styleClass = isActive
              ? isAll || isOwnership
                ? badge.activeStyle!
                : PRIORITY_STYLES[badge.id]?.active
              : isAll
                ? "bg-slate-50 text-slate-500 border-slate-200"
                : isOwnership
                  ? "bg-[#fdfdfd] text-slate-500 border-slate-200"
                  : PRIORITY_STYLES[badge.id]
                    ? `${PRIORITY_STYLES[badge.id].bg} ${PRIORITY_STYLES[badge.id].text} ${PRIORITY_STYLES[badge.id].border}`
                    : "bg-slate-50 text-slate-500 border-slate-100";
            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isAll) {
                    setFilter("tab", null);
                    setFilter("priority", null);
                  } else if (isOwnership) {
                    setFilter("tab", badge.id);
                  } else {
                    setFilter("priority", badge.id);
                  }
                }}
                className={`px-3 py-1 flex items-center gap-1.5 rounded-full text-[10px] font-medium border cursor-pointer transition-all ${styleClass}`}
              >
                <span>{badge.label}</span>
                <span className={`opacity-80 ${isActive ? "text-white" : ""}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ChevronRight size={16} className="text-slate-500" />
      </button>
    </div>
  );
};
