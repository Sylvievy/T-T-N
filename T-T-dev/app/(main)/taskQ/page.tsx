"use client";

import Sidebar from "./_components/Sidebar";
import TaskTable from "./_components/TaskTable";
import TaskDetails from "./_components/TaskDetails";
import { motion, AnimatePresence } from "framer-motion";
import { TaskQProvider, useTaskQ } from "@/services/taskQ/TaskQContext";
import { TaskTableHeader } from "@/components/_taskQcomponents/header/TaskTableHeader";
import { TaskQRequestParam } from "@/services/taskQ/TaskQParams";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddTask from "@/components/_taskQcomponents/task/AddTaskForm";
import { GlobalQuickAdd } from "@/components/shared/GlobalQuickAdd";
import { cn } from "@/lib/utils";

const TaskQContent = () => {
  const {
    layoutType,
    setLayoutType,
    closePopup,
    openedPopups,
    isSidebarCollapsed,
    setActiveFolder,
    selectedTask,
    setSelectedTask,
    isQuickAddOpen,
    isAddingTask,
    quickAddMode,
    setIsAddingTask,
    preferredLayout,
    fetchFolderData,
  } = useTaskQ();

  const showPane =
    (selectedTask || isAddingTask || isQuickAddOpen) && layoutType !== "list";

  // console.log("STATE:", {
  //   isQuickAddOpen,
  //   isAddingTask,
  //   layoutType,
  //   showPane,
  //   quickAddMode,
  // });
  const handleFolderSelect = (folderId: string) => {
    const mapping: Record<string, TaskQRequestParam> = {
      Inbox: "GetInboxTasks",
      Sent: "GetSentTasks",
      DueToday: "GetDueTodayTasks",
      Unread: "GetUnreadTasks",
      PastDue: "GetPastDueTasks",
      ToDo: "GetToDoTasks",
      Completed: "GetCompletedTasks",
      Disabled: "GetDisabledTasks",
    };

    const selectedParam = mapping[folderId] || "GetInboxTasks";

    setActiveFolder(selectedParam);
    fetchFolderData(selectedParam);
  };

  return (
    <div className="flex h-full gap-2 w-full overflow-hidden bg-[#fdfdfd] p-2">
      {/* PANE 1: SIDEBAR */}
      <aside
        className={cn(
          "transition-all duration-300 bg-white rounded-lg border shadow-sm flex-shrink-0 overflow-hidden",
          isSidebarCollapsed ? "w-14" : "w-52",
        )}
      >
        <Sidebar />
      </aside>

      <div className="flex-1 flex rounded-lg flex-col min-w-0 gap-2">
        <header className="bg-[#fdfdfd] rounded-xl border shadow-sm shrink-0">
          <TaskTableHeader onLayoutChange={setLayoutType} />
        </header>

        {/* CONTENT AREA: Dynamic Table and Details */}
        <main
          className={cn(
            "flex-1 flex min-h-0 gap-2 transition-all duration-500",
            layoutType === "bottom" ? "flex-col" : "flex-row",
          )}
        >
          {/* PANE 2: TABLE */}
          <section className="flex-1 min-w-0 bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
            <TaskTable onLayoutChange={setLayoutType} />
          </section>

          {/* PANE 3: TASK DETAILS */}
          <AnimatePresence mode="wait">
            {showPane && (
              <motion.section
                initial={{
                  opacity: 0,
                  x: layoutType === "right" ? 20 : 0,
                  y: layoutType === "bottom" ? 20 : 0,
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{
                  opacity: 0,
                  x: layoutType === "right" ? 20 : 0,
                  y: layoutType === "bottom" ? 20 : 0,
                }}
                className={cn(
                  "bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col shrink-0",
                  layoutType === "right" ||
                    (layoutType === "popup" && preferredLayout === "right")
                    ? "w-[475px]"
                    : "h-[45%] w-full",
                )}
              >
                {isAddingTask ? <AddTask /> : <TaskDetails />}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* FLOATING POP-OVER*/}
      <AnimatePresence>
        {isAddingTask && layoutType === "popup" && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-[10%] left-[35%] z-[200] w-[500px] h-[85%] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <AddTask />
          </motion.div>
        )}
      </AnimatePresence>
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
    </div>
  );
};

export default function TaskQPage() {
  return (
    <TaskQProvider>
      <TaskQContent />
      <GlobalQuickAdd />
    </TaskQProvider>
  );
}
