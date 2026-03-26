"use client";

import { toast } from "sonner";

import { CommentList } from "@/components/_taskQcomponents/task/CommentList";

import {
  X,
  SquarePen,
  Layers,
  MessageSquare,
  CheckSquare,
  Paperclip,
  Tag,
  PlusCircle,
  ChevronDown,
} from "lucide-react";

import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { useTaskQ } from "@/services/taskQ/TaskQContext";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { TaskActions } from "@/components/_taskQcomponents/task/TaskActions";

import { AddFeedback } from "@/components/shared/AddFeedback";

import EditTaskForm from "@/components/_taskQcomponents/task/EditTaskForm";

import { AddTaskChecklist } from "@/components/_taskQcomponents/task/AddTaskCheckList";

import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import { CommentInput } from "@/components/_taskQcomponents/task/CommentInput";

import { QuickAddTask } from "@/components/_dashboardcomponents/QuickAddTask";

interface TaskDetailsProps {
  isModal?: boolean;

  taskOverride?: any;
}

const TaskDetails = ({ isModal = false, taskOverride }: TaskDetailsProps) => {
  const {
    selectedTask: contextTask,

    updateTaskStatus,

    setSelectedTask,

    layoutType,

    comments,

    isQuickAddOpen,

    quickAddMode,

    setQuickAddMode,

    setIsQuickAddOpen,

    openPopup,

    addComment,

    setLayoutType,

    checklist,

    refreshFolder,

    users,

    addChecklistItem,

    toggleCheckItem,

    deleteCheckItem,
  } = useTaskQ();

  const task = taskOverride || contextTask;

  const [isEditing, setIsEditing] = useState(false);

  const [newCheckItem, setNewCheckItem] = useState("");

  const [isExpanded, setIsExpanded] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<
    "comments" | "checklist" | "attachments"
  >("comments");

  // Filter comments for the current task

  const selectedTaskComments = comments.filter(
    (c) => task && Number(c.TaskID) === Number(task.TaskID),
  );

  const handleSend = async (message: string) => {
    if (!task) return;

    await addComment(task.TaskID, message);
  };

  // If quick add IS open but no task is selected, we show the "Empty state Quick Add"

  if (!task && !isQuickAddOpen) return null;

  const myId =
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_asp_net_user_id")
      : null;

  const creatorId = task?.CreatorUserID || task?.TaskCreatorUserID || null;

  const AssignedById =
    task?.CurrentOwnerUserID || task?.TaskCurrentOwnerUserID || null;

  const CurrentOwnerId =
    task?.NextOwnerAspNetUserID || task?.TaskNextOwnerID || null;

  const isAssignerX = myId === creatorId;

  const isAssigneeY = myId === AssignedById;

  const isDelegateZ = myId === CurrentOwnerId;

  const isSelfAssigned =
    (AssignedById &&
      CurrentOwnerId &&
      AssignedById === CurrentOwnerId &&
      myId === AssignedById) ||
    (isAssignerX && isAssigneeY && !CurrentOwnerId);

  const hasNextOwner = !!CurrentOwnerId && CurrentOwnerId !== AssignedById;

  const currentStatus = (task?.StatusName || "")

    .toUpperCase()

    .replace("-", " ")

    .trim();

  const handleStatusUpdate = async (
    action: string,

    userComment: string,

    extraParams: Record<string, any> = {},
  ) => {
    const toastId = toast.loading(`Processing...`);

    try {
      const isSuccess = await updateTaskStatus(
        task.TaskID,

        action,

        userComment.trim(),

        extraParams,
      );

      if (isSuccess) {
        refreshFolder();

        toast.success(`Task successfully updated!`, { id: toastId });
        if (action === "FinalComplete") {
          setLayoutType("list");
          setSelectedTask(null);
        }
      } else {
        toast.error(`Update failed.`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  console.log("self-assign check :", {
    myId,

    creatorId,

    AssignedById,

    CurrentOwnerId,

    isAssignerX,

    isAssigneeY,

    isSelfAssigned,

    hasNextOwner,

    isDelegateZ,
    task,
  });

  const filteredChecklistCount = checklist.filter(
    (item) => String(item.TaskID) === String(task?.TaskID),
  ).length;

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white overflow-visible relative">
        {task ? (
          <>
            {/* SECTION 1: TOP (Title, Header, Metrics) */}

            <div className="flex flex-col shrink-0 bg-white z-10">
              <div className="px-3 py-3 flex flex-col border-b gap-2">
                {/* Row 1: Title + Right panel */}

                <div className="flex justify-between items-start gap-2">
                  <h1
                    className={cn(
                      "text-base font-semibold text-slate-900 cursor-default leading-tight",

                      !isExpanded && "line-clamp-2",
                    )}
                  >
                    {task.TaskTitle}
                  </h1>

                  {/* Right: Task ID + Creator + Close */}

                  <div className="flex items-start gap-1 border-l border-slate-300 pl-2 shrink-0">
                    <div className="flex flex-col items-start cursor-default">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                          ID:
                        </span>

                        <span className="text-slate-700 font-semibold mr-1 text-xs">
                          {task.TaskID}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                          Creator:
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {task.TaskCreator || task.AssignedBy || "N/A"}
                        </span>
                      </div>
                    </div>

                    {!isModal &&
                      (layoutType === "right" || layoutType === "bottom") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-500 -mt-1"
                          onClick={() => {
                            setLayoutType("list");

                            setSelectedTask(null);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                  </div>
                </div>

                {/* Row 2: Description full width */}

                <div
                  className="flex items-start gap-1 cursor-pointer group"
                  onClick={() => setIsExpanded((p) => !p)}
                >
                  <p
                    className={cn(
                      "text-slate-500 text-xs",

                      !isExpanded && "line-clamp-3",
                    )}
                  >
                    {task.TaskDescription || "No description"}
                  </p>

                  <ChevronDown
                    size={12}
                    className={cn(
                      "shrink-0 text-slate-400 mt-0.5 transition-transform",

                      isExpanded && "rotate-180",
                    )}
                  />
                </div>
              </div>

              <header className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex gap-1">
                  {isAssignerX && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsEditing(true)}
                    >
                      <SquarePen size={16} />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openPopup(task)}
                  >
                    <Layers size={16} />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-1 items-center">
                    <Tag className="w-3 h-3 text-slate-700 -scale-x-100" />

                    <span className="text-xs text-slate-700 font-semibold">
                      {task.TaskType}
                    </span>
                  </div>

                  <Badge className="bg-[#a3bfaa] text-[#30493b] text-xs font-bold">
                    {task.StatusName || "Assigned"}
                  </Badge>
                </div>
              </header>

              {/* Metrics */}

              <div className="flex items-center w-full py-4 border-b bg-white h-20 shrink-0">
                {[
                  {
                    label: "Assigned By",

                    value: task.AssignedBy || "N/A",

                    suffix: isAssignerX ? "(Creator)" : "",
                  },

                  {
                    label: "Current Owner",

                    value: task.CurrentOwner || "Unassigned",
                  },

                  { label: "Due Date", value: formatDate(task.TaskDueDate) },

                  { label: "Priority", value: task.Priority },
                ].map((metric, index, array) => (
                  <div
                    key={metric.label}
                    className="flex items-center h-full flex-1"
                  >
                    <div className="flex flex-col items-center text-center w-full px-1">
                      <p className="text-[11px] font-semibold text-slate-600 tracking-wider mb-1">
                        {metric.label}
                      </p>

                      <p className="text-xs font-bold text-slate-700 truncate w-full px-2">
                        {metric.value}
                      </p>
                    </div>

                    {index !== array.length - 1 && (
                      <div className="h-8 w-[1px] bg-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}

            <div className="flex items-center w-full px-3 py-1.5 border-b bg-white justify-end shrink-0">
              <TaskActions
                currentStatus={currentStatus}
                isAssigneeY={isAssigneeY}
                isAssignerX={isAssignerX}
                isDelegateZ={isDelegateZ}
                isSelfAssigned={isSelfAssigned}
                hasNextOwner={hasNextOwner}
                users={users}
                onUpdate={handleStatusUpdate}
              />
            </div>

            {/* SECTION 2: BODY (Tabs and Tab Content) */}

            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
              <div className="flex gap-6 border-b px-3 pt-4 bg-white text-xs font-bold text-slate-400 shrink-0">
                {[
                  {
                    id: "comments",

                    icon: MessageSquare,

                    label: `Comments (${selectedTaskComments.length})`,
                  },

                  {
                    id: "checklist",

                    icon: CheckSquare,

                    label: `Checklist (${filteredChecklistCount})`,
                  },

                  {
                    id: "attachments",

                    icon: Paperclip,

                    label: "Attachments (0)",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={cn(
                      "pb-2 border-b-2 transition-all flex items-center gap-1.5",

                      activeSubTab === tab.id
                        ? "border-[#30493b] text-[#30493b]"
                        : "border-transparent hover:text-slate-600",
                    )}
                  >
                    <tab.icon size={14} />

                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {activeSubTab === "comments" && (
                  <CommentList
                    comments={selectedTaskComments}
                    myId={myId}
                    formatTime={formatTime}
                  />
                )}

                {activeSubTab === "checklist" && (
                  <AddTaskChecklist
                    items={checklist.filter(
                      (item) => String(item.TaskID) === String(task.TaskID),
                    )}
                    newItem={newCheckItem}
                    setNewItem={setNewCheckItem}
                    onAdd={async () => {
                      if (newCheckItem.trim()) {
                        const success = await addChecklistItem(
                          task.TaskID,

                          newCheckItem,
                        );

                        if (success) setNewCheckItem("");
                      }
                    }}
                    onRemove={(_, id) => {
                      console.log("Delete is disabled");
                      // deleteCheckItem(String(id), task.TaskID)
                    }}
                    onToggle={(_, id, currentStatus) => {
                      if (id)
                        toggleCheckItem(
                          String(id),

                          String(task.TaskID),

                          !!currentStatus,
                        );
                    }}
                  />
                )}

                {activeSubTab === "attachments" && (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                    No attachments available.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <PlusCircle className="text-[#30493b] w-8 h-8" />
            </div>

            <h3 className="text-slate-900 font-semibold mb-1">
              Quick Add Mode
            </h3>

            <p className="text-slate-500 text-xs max-w-[200px]">
              Type below to instantly create a task in your inbox.
            </p>
          </div>
        )}

        {/* SHARED INPUT AREA (Bottom) */}

        {/* <div className="shrink-0 border-t bg-[white] px-3 py-1 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">

<AnimatePresence mode="wait">

{isQuickAddOpen ? (

<motion.div

key="quick-add"

initial={{ opacity: 0, y: 10 }}

animate={{ opacity: 1, y: 0 }}

exit={{ opacity: 0, y: 10 }}

>

<QuickAddTask />

</motion.div>

) : (

<motion.div

key="comment-input"

initial={{ opacity: 0, y: -10 }}

animate={{ opacity: 1, y: 0 }}

exit={{ opacity: 0, y: -10 }}

>

<CommentInput onSend={handleSend} />

</motion.div>

)}

</AnimatePresence>

</div> */}

        {/* SHARED INPUT AREA (Bottom) */}

        <div className="shrink-0 border-t bg-white px-3 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] min-h-[50px]">
          <CommentInput onSend={handleSend} />
        </div>
      </div>

      {/* Edit Portal */}

      {typeof window !== "undefined" &&
        isEditing &&
        task &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-600/20 "
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[500px] h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              <EditTaskForm task={task} onClose={() => setIsEditing(false)} />
            </motion.div>
          </div>,

          document.body,
        )}
    </>
  );
};

export default TaskDetails;
