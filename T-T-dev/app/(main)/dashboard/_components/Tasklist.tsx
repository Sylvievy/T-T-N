"use client";

import { useState } from "react";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";
import { useTaskLogFilters } from "../../../hooks/useTaskLogFilters";
import { formatDate } from "@/lib/utils";
import { TaskStats } from "../../../../components/_dashboardcomponents/TaskStats";
import { TaskToolbar } from "../../../../components/_dashboardcomponents/TaskToolbar";
import { TaskBadges } from "../../../../components/_dashboardcomponents/TaskBadges";
import { TaskCards } from "../../../../components/_dashboardcomponents/TaskCards";
import { TaskPagination } from "../../../../components/_dashboardcomponents/TaskPagination";
import { QuickAddTask } from "@/components/_dashboardcomponents/QuickAddTask";
import {
  SummaryCount,
  TypePriority,
  TaskStatus,
  ByUsers,
  Comments,
} from "@/services/dashboard/DashboardParams";

import { TaskLog } from "@/services/GlobalParams";
import { useTaskQ } from "@/services/taskQ/TaskQContext";

interface TaskListProps {
  data: {
    tasks: TaskLog[];
    fullTaskLog: TaskLog[];
    summary: SummaryCount;
    typePriority: TypePriority[];
    taskStatus: TaskStatus[];
    tasksByUsers: ByUsers[];
    comments: Comments[];
    addComment: (taskId: string, text: string) => Promise<boolean>;
    activeCommentTasks: string[];
    handleCommentToggle: (taskId: string) => void;
    onActionSuccess?: () => void; // Add this
  };
}

const Tasklist = ({ data }: TaskListProps) => {
  const {
    tasks,
    fullTaskLog,
    typePriority,
    taskStatus,
    tasksByUsers,
    comments,
    addComment,
    activeCommentTasks,
    handleCommentToggle,
    onActionSuccess,
  } = data;
  const { openPopup } = useTaskQ();
  const summary = Array.isArray(data.summary) ? data.summary[0] : data.summary;
  const { filters, setFilter, resetFilters } = useDashboardFilters();

  const myId =
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_asp_net_user_id")
      : null;

  const {
    paginatedTasks,
    totalPages,
    currentPage,
    totalCount,
    setCurrentPage,
  } = useTaskLogFilters(tasks, filters);

  return (
    <div className="flex flex-col h-full gap-1">
      {/* Top Section: Shelves & Filters */}
      <div className="flex flex-col gap-2 px-1 rounded-lg">
        <TaskStats
          summary={summary}
          activeTab={filters.quickFilter || filters.tab || ""}
          onTabChange={(tabId: string) => {
            console.log("Tab changed to:", tabId);
          }}
        />

        <TaskToolbar
          search={filters.search}
          onSearchChange={(val) => setFilter("search", val)}
          onReset={resetFilters}
          typePriority={typePriority}
          taskStatus={taskStatus}
          tasksByUsers={tasksByUsers}
        />

        <TaskBadges
          filters={filters}
          setFilter={setFilter}
          summary={summary}
          typePriority={typePriority}
          taskLog={fullTaskLog}
          filteredCount={totalCount}
        />
      </div>

      {/* Main Content: List & Pagination */}
      <div className="flex flex-col flex-1 px-1 rounded-lg shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar custom-scrollbar-hide">
          {paginatedTasks.map((task) => {
            const isAssignerX = [
              String(task.TaskOwnerUserID),
              String(task.CreatorASPNetUserID),
            ].some((id) => id.trim() === String(myId).trim());
            return (
              <TaskCards
                key={task.TaskID}
                task={task}
                comments={(comments || []).filter(
                  (c) => c.TaskID === task.TaskID,
                )}
                isActiveComment={activeCommentTasks.includes(task.TaskID)}
                onCommentToggle={() => handleCommentToggle(task.TaskID)}
                formatDate={formatDate}
                onSendMessage={(text) => addComment(task.TaskID, text)}
                onDoubleClick={() => openPopup(task)}
                isAssignerX={isAssignerX}
                onActionSuccess={onActionSuccess}
              />
            );
          })}
        </div>
        <div className="flex-col py-1 gap-1 roun bg-[#fdfdfd] border-t-2">
          <TaskPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <QuickAddTask />
        </div>
      </div>
    </div>
  );
};

export default Tasklist;
