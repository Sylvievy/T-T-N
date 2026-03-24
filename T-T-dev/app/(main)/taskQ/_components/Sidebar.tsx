"use client";

import {
  Folder,
  Inbox,
  Plus,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  Ban,
  Menu,
} from "lucide-react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { Button } from "@/components/ui/button";
import { TaskQRequestParam } from "@/services/taskQ/TaskQParams";
import { SidebarCategories } from "@/components/_taskQcomponents/SidebarCategories";
const Sidebar = () => {
  const {
    activeFolder,
    setActiveFolder,
    counts,
    isSidebarCollapsed,
    setSidebarCollapsed,
    handleOpenAddTask,
    setSelectedTask,
    setLayoutType,
    setIsAddingTask,
  } = useTaskQ();

  const isActive = (id: string) => activeFolder === id;

  const primaryFolders = [
    {
      id: "GetInboxTasks",
      label: "Inbox",
      icon: Inbox,
      count: counts.InboxCount,
    },
    { id: "GetSentTasks", label: "Sent", icon: Send, count: counts.SentCount },
    {
      id: "GetDueTodayTasks",
      label: "Due Today",
      icon: Clock,
      count: counts.DueTodayCount,
    },
    {
      id: "GetUnreadTasks",
      label: "Unread",
      icon: Folder,
      count: counts.UnreadCount,
    },
    {
      id: "GetPastDueTasks",
      label: "Past Due",
      icon: AlertCircle,
      count: counts.PastDueCount,
    },
    {
      id: "GetToDoTasks",
      label: "To Do",
      icon: Folder,
      count: counts.TodoCount,
    },
    {
      id: "GetCompletedTasks",
      label: "Completed",
      icon: CheckCircle,
      count: counts.CompletedCount,
    },
    {
      id: "GetDisabledTasks",
      label: "Disabled",
      icon: Ban,
      count: counts.DisabledCount,
    },
  ];

  return (
    <div className="flex flex-col h-full max-h-screen bg-[#fdfdfd] text-slate-700 select-none border-l border-slate-100 overflow-hidden">
      {/* HEADER */}
      <div
        className={`px-4 py-2 flex ${isSidebarCollapsed ? "flex-col items-center gap-4" : "flex-row items-center justify-between"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="hover:bg-slate-200 shrink-0"
        >
          <Menu size={20} />
        </Button>

        <Button
          onClick={() => {
            setLayoutType("right");

            handleOpenAddTask();
          }}
          size={isSidebarCollapsed ? "icon" : "sm"}
          className={`bg-[#30493b] text-white hover:bg-[#30493b]/90 rounded-full transition-all ${
            isSidebarCollapsed ? "h-8 w-8 p-0" : "px-3 gap-2"
          }`}
        >
          <Plus size={18} />
          {!isSidebarCollapsed && (
            <span className="text-xs font-semibold">New Task</span>
          )}
        </Button>
      </div>

      {/* FIXED TOP SECTION */}
      <nav className="px-3 space-y-0.5 border-b border-slate-300">
        {primaryFolders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id as TaskQRequestParam)}
            className={`w-full flex items-center transition-all py-2 rounded-lg ${
              isSidebarCollapsed
                ? "justify-center px-0"
                : "justify-between px-3"
            } ${isActive(folder.id) ? "bg-[#a3bfaa] text-[#30493b] font-bold" : "hover:bg-slate-200 text-slate-600"}`}
          >
            <div className="flex items-center gap-2">
              <folder.icon
                size={16}
                className={
                  isActive(folder.id) ? "text-slate-900" : "text-slate-700"
                }
              />
              {!isSidebarCollapsed && (
                <span
                  className={`text-[12px] font-medium ${isActive(folder.id) ? "text-slate-900" : "text-slate-700"}`}
                >
                  {folder.label}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && folder.count !== undefined && (
              <span
                className={`text-[11px] font-semibold ${isActive(folder.id) ? "text-slate-900" : "text-slate-700"}`}
              >
                {folder.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* SCROLLABLE CATEGORY SECTION */}
      {!isSidebarCollapsed && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <SidebarCategories />
        </div>
      )}
    </div>
  );
};
export default Sidebar;
