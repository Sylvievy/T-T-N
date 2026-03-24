import {
  Flag,
  UserRound,
  MoveUpRight,
  MoveDownRight,
  Tag,
  MessageSquare,
  ListCheck,
  Paperclip,
  MapPin,
  EllipsisVertical,
} from "lucide-react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentBox from "./CommentBox";
import { Comments } from "@/services/dashboard/DashboardParams";
import { TaskLog } from "@/services/GlobalParams";
import PriorityFlag from "../_taskQcomponents/tasktable/PriorityFlag";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskActions } from "@/components/_taskQcomponents/task/TaskActions";
import { useTaskQ } from "@/services/taskQ/TaskQContext";

interface TaskCardProps {
  task: TaskLog;
  comments: Comments[];
  isActiveComment: boolean;
  onCommentToggle: () => void;
  formatDate: (date: string) => string;
  onSendMessage: (text: string) => Promise<boolean>;
  onDoubleClick: () => void;
  isAssignerX?: boolean;
  onActionSuccess?: () => void; // Add this
}

export const TaskCards = ({
  task,
  comments,
  isActiveComment,
  onCommentToggle,
  formatDate,
  onSendMessage,
  onActionSuccess,
  onDoubleClick,
}: TaskCardProps) => {
  const { users, updateTaskStatus, refreshFolder } = useTaskQ();
  const myId =
    typeof window !== "undefined"
      ? localStorage.getItem("taskQ_asp_net_user_id")
      : null;

  const creatorId =
    task?.CreatorASPNetUserID || // TaskLog
    // task?.CreatorAspNetUserID ||      // Task
    null;

  // Determine Current Owner (Y)
  const assignedById =
    task?.AssignedByASPNetUserID || // TaskLog
    // task?.CurrentOwnerAspNetUserID ||     // Task
    null;

  // Determine Next Owner / Delegate (Z)
  const currentownerId =
    task?.CurrentOwnerASPNetUserID || // TaskLog
    // task?.NextOwnerAspNetUserID ||        // Task
    null;
  const isAssignerX = String(myId) === String(creatorId);
  const isAssigneeY = String(myId) === String(assignedById);
  const isDelegateZ = String(myId) === String(currentownerId);
  const isSelfAssigned = isAssignerX && isAssigneeY;
  const hasNextOwner = !!currentownerId && currentownerId !== assignedById;

  const handleStatusUpdate = async (
    action: string,
    userComment: string,
    extraParams = {},
  ) => {
    const isSuccess = await updateTaskStatus(
      task.TaskID,
      action,
      userComment,
      extraParams,
    );
    if (isSuccess) refreshFolder();
    if (onActionSuccess) onActionSuccess();
  };

  return (
    <>
      <Card
        className="shadow-sm border cursor-pointer border-slate-200 hover:border-slate-400 transition-all bg-[#fdfdfd]"
        onDoubleClick={onDoubleClick}
      >
        <CardContent className="p-2">
          {/* Task Title and Due Date */}

          <div className="flex justify-between border-b items-start mb-2 px-1 pb-1">
            <h3 className="text-xs font-medium text-slate-800 leading-snug line-clamp-1 flex-1 pr-2">
              {task.TaskTitle}
            </h3>

            <span className="text-[10px] text-slate-500 whitespace-nowrap  font-medium">
              {formatDate(task.TaskDueDate)}
            </span>
          </div>

          {/* Ownership Section */}

          <div className="flex items-center   justify-between px-1">
            <div className="flex items-center gap-1 min-w-0">
              <div className="flex items-center min-w-0">
                <UserRound className="w-3 h-3 text-slate-400 shrink-0" />

                <MoveUpRight className="w-3 h-3 text-slate-400 shrink-0" />
              </div>

              <span className="text-xs text-slate-700 truncate">
                {task.AssignedBy}
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 justify-end">
              <div className="flex items-center gap-0 min-w-0">
                <UserRound className="w-3 h-3 text-slate-400 shrink-0" />

                <MoveDownRight className="w-3 h-3 text-slate-400 shrink-0" />
              </div>

              <span className="text-[11px] text-slate-700 truncate">
                {task.CurrentOwner}
              </span>
            </div>
          </div>

          {/* Utility Row */}

          <div className="px-1 flex items-center justify-between pt-1 ">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto custom-scrollbar-hide">
              <div className="flex items-center gap-2">
                <PriorityFlag priority={task.Priority} />

                <div className="flex gap-1 items-center">
                  <Tag className="w-3 h-3 text-slate-700 -scale-x-100" />

                  <span className="text-[11px] text-slate-700">
                    {task.TaskType}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}

              <div className="flex flex-1 items-center justify-end w-full gap-5 px-2">
                <div className="relative">
                  <MessageSquare
                    className="w-3 h-3 text-slate-700 cursor-pointer hover:text-[#30493b]"
                    onClick={onCommentToggle}
                  />
                </div>

                <ListCheck className="w-3 h-3 text-slate-700" />

                <Paperclip className="w-3 h-3 text-slate-700 -rotate-45" />

                <MapPin className="w-3 h-3 text-slate-700" />
              </div>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 pl-3 rounded-full hover:bg-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVertical className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-2" align="end">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                    Actions
                  </p>
                  <TaskActions
                    currentStatus={task.StatusName || "Assigned"}
                    isAssignerX={isAssignerX}
                    isAssigneeY={isAssigneeY}
                    isDelegateZ={isDelegateZ}
                    isSelfAssigned={isSelfAssigned}
                    hasNextOwner={hasNextOwner}
                    users={users}
                    onUpdate={handleStatusUpdate}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
