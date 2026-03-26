"use client";

import { useState } from "react";
import Tasklist from "./_components/Tasklist";
import TasksByStatus from "./_components/TasksByStatus";
import TasksByTimeline from "./_components/TasksByTimeline";
import TasksByTypePriority from "./_components/TasksByTypePriority";
import TasksByUsers from "./_components/TasksByUsers";
import { TaskHistoryChart } from "./_components/TaskHistoryChart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw } from "lucide-react";
import {
  DashboardProvider,
  useDashboardFilters,
} from "@/services/dashboard/DashboardContext";
import { useDashboardData } from "@/services/dashboard/DashboardData";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { motion } from "framer-motion";
import AddTask from "@/components/_taskQcomponents/task/AddTaskForm";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TaskDetails from "../taskQ/_components/TaskDetails";
import CommentBox from "@/components/_dashboardcomponents/CommentBox";

export const FloatingFilters = () => {
  const { filters, setFilter, resetFilters } = useDashboardFilters();

  const activeFilterEntries = Object.entries(filters).filter(
    ([key, value]) =>
      value !== null && value !== "" && key !== "sortBy" && key !== "sortOrder",
  );
  if (activeFilterEntries.length === 0) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.2}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-20 right-1/3"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full flex border items-center justify-center h-10 w-10 shadow-2xl bg-blue-200 hover:border-blue-400"
          >
            <Filter className="h-6 w-6 text-blue fill-blue-400 stroke-none hover:fill-blue-200" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
              {activeFilterEntries.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-2 mr-4 mb-2 shadow-xl bg-slate-50 border-slate-300"
          side="top"
        >
          <div className="flex items-center justify-between  border-b pb-2">
            <h4 className="font-semibold text-sm">Active Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6  text-xs text-red-500"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilterEntries.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center  bg-slate-100"
              >
                <span className="text-[10px]  opacity-50 font-bold">
                  {key}:
                </span>
                <span className="text-xs truncate max-w-[100px]">
                  {typeof value === "object" && value !== null
                    ? (value as any).from
                      ? `${new Date((value as any).from).toLocaleDateString()} - ${new Date((value as any).to).toLocaleDateString()}`
                      : JSON.stringify(value) // Fallback for other objects
                    : String(value)}
                </span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setFilter(key as any, value)}
                />
              </Badge>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

const DashboardContent = () => {
  const {
    typePriority,
    taskLog,
    tasksByUsers,
    taskStatus,
    summary,
    loading,
    comments,
    addComment,
    historyData,
    error,
    refresh,
  } = useDashboardData();

  const {
    isAddingTask,
    setIsAddingTask,
    setLayoutType,
    openedPopups,
    closePopup,
    setSelectedTask,
    updateReadStatus,
    updateTaskStatus,
  } = useTaskQ();

  const [activeCommentTasks, setActiveCommentTasks] = useState<string[]>([]);

  const handleAddComment = async (taskId: string, text: string) => {
    const success = await addComment(taskId, text);
    if (success) {
    }
    return success;
  };
  const handleCommentToggle = (taskId: string) => {
    setActiveCommentTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const showPane = isAddingTask;

  const DASHBOARD_ITEMS = [
    {
      id: "type-priority",
      title: "By Category & Importance",
      Component: TasksByTypePriority,
      value: typePriority,
      className: "xl:col-span-4 xl:row-span-7 md:col-span-6 p-2",
    },
    {
      id: "timeline",
      title: "Activity Summary",
      Component: TasksByTimeline,
      value: summary,
      className: "xl:col-span-2 xl:row-span-5 md:col-span-6 p-2",
    },
    {
      id: "top-projects",
      title: "Task Activity ",
      Component: TaskHistoryChart,
      value: historyData,
      className: "xl:col-span-3 xl:row-span-5 md:col-span-12 px-2 pt-2",
    },
    {
      id: "task-list",
      title: "",
      Component: Tasklist,
      value: {
        tasks: taskLog,
        fullTaskLog: taskLog,
        summary: summary,
        typePriority: typePriority,
        taskStatus: taskStatus,
        tasksByUsers: tasksByUsers,
        comments: comments,
        addComment: handleAddComment,
        activeCommentTasks: activeCommentTasks,
        handleCommentToggle: handleCommentToggle,
        onActionSuccess: refresh,
      },
      className: "xl:col-span-3 xl:row-span-12 md:col-span-12 px-2 pt-2",
    },
    {
      id: "users",
      title: "By Users and Task types",
      Component: TasksByUsers,
      value: tasksByUsers,
      className: "xl:col-span-5 xl:row-span-7 md:col-span-6 px-2 pt-2",
    },
    {
      id: "status",
      title: "Task Status",
      Component: TasksByStatus,
      value: taskStatus,
      className: " xl:col-span-4 xl:row-span-5 md:col-span-6 px-2 pt-2",
    },
  ];

  return (
    <div className="h-full w-full relative">
      {" "}
      {/* Add relative here */}
      <div className="h-full p-3 grid gap-2 overflow-y-auto md:grid-cols-12 xl:grid-rows-12 xl:overflow-hidden bg-gray-100">
        {DASHBOARD_ITEMS.map(({ id, title, value, Component, className }) => (
          <div
            key={id}
            className={cn(
              className,
              "rounded-lg shadow-sm bg-white flex flex-col border border-slate-200 min-h-[300px] xl:min-h-0",
            )}
          >
            <div className="px-3 py-1 ">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                {title}
              </h4>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Component data={value as any} />
            </div>
          </div>
        ))}
      </div>
      {/* 2. FLOATING POP-UP LOGIC */}
      {/* Add task */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-10 right-10 z-[110] w-[500px] h-[650px] bg-[#fdfdfd] rounded-xl shadow-2xl border border-slate-400 overflow-hidden flex flex-col"
          >
            <div className="h-full ">
              <AddTask />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Task Details */}
      <AnimatePresence>
        {openedPopups.map((task, index) => (
          <motion.div
            key={task.TaskID}
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "10%",
              left: "35%",
              transform: "translate(-50%, -50%)",
              marginTop: `${index * 20}px`,
              marginLeft: `${index * 20}px`,
              zIndex: 110 + index,
            }}
            className="w-[500px] h-[85%] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="absolute top-4 right-4 z-[120]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => closePopup(task.TaskID)}
                className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 -mt-1"
              >
                <X size={20} className="text-slate-500" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TaskDetails isModal={true} taskOverride={task} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {/*comments */}
      {/* 3. MULTIPLE DRAGGABLE COMMENT BOXES */}
      <AnimatePresence>
        {activeCommentTasks.map((taskId, index) => {
          // Find the task object to get the title
          const task = taskLog.find((t) => String(t.TaskID) === taskId);
          if (!task) return null;

          return (
            <motion.div
              key={`comment-${taskId}`}
              drag
              dragMomentum={false}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              // Offset each new box so they don't stack exactly
              style={{
                position: "fixed",
                bottom: `${50 + index * 30}px`,
                right: `${50 + index * 30}px`,
                zIndex: 200 + index,
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <CommentBox
                taskId={String(task.TaskID)}
                taskTitle={task.TaskTitle}
                comments={(comments || []).filter(
                  (c) => String(c.TaskID) === String(task.TaskID),
                )}
                onClose={() => handleCommentToggle(String(task.TaskID))}
                onSendMessage={(text) => addComment(String(task.TaskID), text)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
      <FloatingFilters />
    </DashboardProvider>
  );
};

export default Dashboard;
