"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeftRight,
  X,
  FolderDown,
  Check,
  UserRound,
  CalendarClock,
  RefreshCcw,
  Hourglass,
} from "lucide-react";
import { DateTimePicker } from "./DateTimePicker";
import { format } from "date-fns";
import {
  ShieldCheckIcon,
  ArrowDownIcon,
  XCircleIcon,
  ArrowPathRoundedSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  PlayIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { Users } from "@/services/taskQ/TaskQParams";
import { cn } from "@/lib/utils";

// ─── ICON COMPONENTS ─────────────────────────────────────────────────────────

const ReassignIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative w-[12px] h-[12px] shrink-0", className)}>
    <UserRound className="w-[12px] h-[12px]" />
    <ArrowDownIcon className="w-[12px] h-[10px] absolute -bottom-[-1px] right-[-5px]" />
  </div>
);

// ─── ACTION ICON ─────────────────────────────────────────────────────────────

interface ActionIconProps {
  action: string;
  label: string;
  icon: any;
  colorClass: string;
  activeAction: string | null;
  setActiveAction: (action: string | null) => void;
  comment: string;
  setComment: (comment: string) => void;
  assignToUserId: string;
  setAssignToUserId: (id: string) => void;
  newDueDate: string;
  setNewDueDate: (date: string) => void;
  users: Users[];
  onConfirm: () => void;
}

const ActionIcon = ({
  action,
  label,
  icon: Icon,
  colorClass,
  activeAction,
  setActiveAction,
  comment,
  setComment,
  assignToUserId,
  setAssignToUserId,
  newDueDate,
  setNewDueDate,
  users,
  onConfirm,
}: ActionIconProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <Popover
        modal={true}
        open={activeAction === action}
        onOpenChange={(open) => setActiveAction(open ? action : null)}
      >
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 px-1 py-1 rounded-full border text-[11px] font-semibold cursor-pointer",
                colorClass,
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {label}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[10px] font-semibold">{label}</p>
        </TooltipContent>
        <PopoverContent
          className="w-80 p-4 shadow-xl border-slate-200 !z-[1000]"
          align="end"
        >
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-slate-900">{label}</h4>

            {action === "ReAssignTask" && (
              <select
                className="w-full text-sm p-2 border rounded-md"
                value={assignToUserId}
                onChange={(e) => setAssignToUserId(e.target.value)}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.UserID} value={u.UserID}>
                    {u.UserName}
                  </option>
                ))}
              </select>
            )}

            {action === "ProposeNewTime" && (
              <DateTimePicker
                date={newDueDate ? new Date(newDueDate) : undefined}
                setDate={(d) => setNewDueDate(d ? d.toISOString() : "")}
                className="h-9"
                autoOpen={true}
              />
            )}

            <Textarea
              placeholder="Add a comment (optional)..."
              className="text-xs min-h-24 focus-visible:ring-[#31473a]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setActiveAction(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className={cn(
                  "text-xs text-white",
                  colorClass
                    .split(" ")[0]
                    .replace("text-", "bg-")
                    .replace("bg-", "!bg-"),
                  "hover:opacity-90",
                )}
                onClick={onConfirm}
              >
                {label}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  </TooltipProvider>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface TaskActionsProps {
  currentStatus: string;
  isAssignerX: boolean; // viewer is the task creator (X)
  isAssigneeY: boolean; // viewer is the assigend by (Y)
  isDelegateZ: boolean; // viewer is the current owner (Z)
  isSelfAssigned: boolean;
  hasNextOwner: boolean;
  users: Users[];
  onUpdate: (action: string, comment: string, extraParams?: object) => void;
}

export const TaskActions = ({
  currentStatus,
  isAssignerX,
  isAssigneeY,
  isDelegateZ,
  hasNextOwner,
  isSelfAssigned,
  users,
  onUpdate,
}: TaskActionsProps) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [assignToUserId, setAssignToUserId] = useState<string>("");
  const [newDueDate, setNewDueDate] = useState<string>("");

  // ── Derived role flags ────────────────────────────────────────────────────
  //
  // isSelfAssigned: X is doing the task themselves (no separate Y)
  // isYMonitoring:  Y delegated to Z — Y is now reviewer, not executor
  // isYExecuting:   Y holds the task and has NOT delegated to Z
  //

  const isTrulySelfAssigned = isSelfAssigned || (isAssigneeY && isDelegateZ);

  const isYMonitoring = isAssigneeY && hasNextOwner && !isDelegateZ;

  const isYExecuting =
    isAssigneeY && !hasNextOwner && !isAssignerX && !isTrulySelfAssigned;

  const status = currentStatus.toUpperCase().replace(/-/g, " ").trim();

  // ── Confirm handler ───────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!activeAction) return;
    let extraParams: Record<string, any> = {};

    if (activeAction === "ReAssignTask") {
      if (!assignToUserId) return;
      extraParams = { AssignToUserID: Number(assignToUserId) };
    }
    if (activeAction === "ProposeNewTime") {
      if (!newDueDate) return;
      extraParams = {
        NewDueDate: format(new Date(newDueDate), "yyyy-MM-dd HH:mm:ss"),
      };
    }

    onUpdate(activeAction, comment, extraParams);
    setComment("");
    setActiveAction(null);
    setNewDueDate("");
    setAssignToUserId("");
  };

  // ── Render helper ─────────────────────────────────────────────────────────
  const btn = (
    action: string,
    label: string,
    colorClass: string,
    icon: any,
  ) => (
    <ActionIcon
      key={action}
      action={action}
      label={label}
      colorClass={colorClass}
      icon={icon}
      activeAction={activeAction}
      setActiveAction={setActiveAction}
      comment={comment}
      setComment={setComment}
      assignToUserId={assignToUserId}
      setAssignToUserId={setAssignToUserId}
      newDueDate={newDueDate}
      setNewDueDate={setNewDueDate}
      users={users}
      onConfirm={handleConfirm}
    />
  );

  console.log("self-assign check:", {
    isSelfAssigned,
  });

  // ── Shared button definitions (avoids repetition) ─────────────────────────
  const B = {
    disable: () =>
      btn(
        "DisableTask",
        "Disable",
        "text-gray-500 border-gray-200 hover:bg-gray-50",
        FolderDown,
      ),
    enable: () =>
      btn(
        "EnableTask",
        "Enable",
        "text-green-600 border-green-200 hover:bg-green-50",
        LockOpenIcon,
      ),
    complete: () =>
      btn(
        "FinalComplete",
        "Complete",
        "text-green-700 border-green-300 hover:bg-green-50",
        Check,
      ),
    recall: () =>
      btn(
        "RecallTask",
        "Recall",
        "text-orange-500 border-orange-200 hover:bg-orange-50",
        ArrowPathRoundedSquareIcon,
      ),
    assignTo: () =>
      btn(
        "ReAssignTask",
        "Reassign",
        "text-blue-600 border-blue-200 hover:bg-blue-50",
        ArrowLeftRight,
      ),
    accept: () =>
      btn(
        "AcceptTask",
        "Accept",
        "text-green-600 border-green-200 hover:bg-green-50",
        ShieldCheckIcon,
      ),
    decline: () =>
      btn(
        "DeclineTask",
        "Decline",
        "text-red-600 border-red-200 hover:bg-red-50",
        XCircleIcon,
      ),
    proposeTime: (label = "Propose New Time") =>
      btn(
        "ProposeNewTime",
        label,
        "text-orange-600 border-orange-200 hover:bg-orange-50",
        CalendarClock,
      ),
    inProcess: () =>
      btn(
        "InProcess",
        "In Process",
        "text-purple-600 border-purple-200 hover:bg-purple-50",
        RefreshCcw,
      ),
    done: () =>
      btn(
        "CompleteForReview",
        "Done",
        "text-indigo-600 border-indigo-200 hover:bg-indigo-50",
        Hourglass,
      ),
    acceptTime: () =>
      btn(
        "AcceptProposedTime",
        "Accept New Time",
        "text-green-600 border-green-200 hover:bg-green-50",
        ShieldCheckIcon,
      ),
    declineTime: () =>
      btn(
        "DeclineProposedTime", //RejectProposedTime
        "Decline New Time",
        "text-red-600 border-red-200 hover:bg-red-50",
        XCircleIcon,
      ),
    declineReview: () =>
      btn(
        "ReviewDecline",
        "Decline Review",
        "text-red-600 border-red-200 hover:bg-red-50",
        XCircleIcon,
      ),
    // Y's escalation button in 3-level review — labelled "Done", not "Complete"
    yDoneReview: () =>
      btn(
        "ReviewAccept",
        "Done",
        "text-indigo-600 border-indigo-200 hover:bg-indigo-50",
        Hourglass,
      ),
  };

  // ── X's persistent buttons (present at every active stage) ───────────────
  // Spec: X always sees Disable, Complete, Assign To, Recall unless task is
  // Completed, Disabled (where only Enable + Recall show), or self-assigned.
  const xPersistent = () => (
    <>
      {B.complete()}
      {B.assignTo()}
      {B.disable()}
      {B.recall()}
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // COMPLETED — terminal, no actions for anyone
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "COMPLETED") {
    return <div className="flex items-center gap-1" />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DISABLED — X sees Enable + Recall; everyone else sees nothing
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "DISABLED" || status === "DISABLE") {
    if (!isAssignerX) return <div className="flex items-center gap-1" />;
    return (
      <div className="flex  items-end gap-1">
        {B.enable()}
        {/* {B.recall()} */}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DECLINED — X: Disable, Assign To, Recall. Y/Z: nothing.
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "DECLINED") {
    if (!isAssignerX) return <div className="flex items-center gap-1" />;
    return (
      <div className="flex  items-end gap-1">
        {B.assignTo()}
        {B.disable()}
        {B.recall()}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECALL — transient state; task will settle to Assigned.
  // Treat as Assigned for X.
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "RECALL") {
    if (!isAssignerX) return <div className="flex items-center gap-1" />;
    return <div className="flex  items-end gap-1">{xPersistent()}</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNED
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "ASSIGNED") {
    return (
      <div className="flex items-end gap-1">
        {/* 1. Priority: Self-Assigned Mode */}
        {isSelfAssigned ? (
          <>
            {B.inProcess()}
            {B.assignTo()}
            {B.disable()}
            {B.proposeTime("Change Time")}

            {/* {B.recall()} */}
          </>
        ) : (
          /* 2. Secondary: If not self-assigned, check specific roles */
          <>
            {/* Y (External Assignee) */}
            {isYExecuting && (
              <>
                {B.accept()}
                {B.decline()}
                {B.proposeTime()}
              </>
            )}
            {/* Z (Third-party Delegate) */}
            {isDelegateZ &&
              !isAssigneeY && ( // Added !isAssigneeY check here
                <>
                  {B.accept()}
                  {B.decline()}
                  {B.proposeTime()}
                </>
              )}
            {/* X (Creator) - ONLY if not also the person doing the work */}
            {isAssignerX && !isDelegateZ && !isAssigneeY && xPersistent()}{" "}
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCEPTED
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "ACCEPTED") {
    return (
      <div className="flex  items-end gap-1">
        {/* Self-assigned Accepted (shouldn't normally occur — self skips Accept
            — but handle defensively same as Assigned) */}
        {isSelfAssigned && (
          <>
            {B.inProcess()}
            {B.proposeTime("Change Time")}
            {B.assignTo()}
            {B.disable()}
            {/* {B.recall()} */}
          </>
        )}
        {/* Y executing (2-level): Assign To, In Process, Propose New Time */}
        {isYExecuting && (
          <>
            {B.assignTo()}
            {B.inProcess()}
            {B.proposeTime()}
          </>
        )}
        {/* Y monitoring (3-level — Y has already delegated to Z):
            Spec: Y sees Recall only at Accepted stage */}
        {isYMonitoring && <>{B.recall()}</>}
        {/* Z accepted (3-level): Assign To, In Process, Propose New Time */}
        {isDelegateZ && (
          <>
            {B.assignTo()}
            {B.inProcess()}
            {B.proposeTime()}
          </>
        )}
        {/* X: Disable, Complete, Assign To, Recall */}
        {isAssignerX && !isDelegateZ && !isAssigneeY && xPersistent()}{" "}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROPOSED NEW TIME
  // Spec rule: Assign To is REMOVED from the proposer's buttons here.
  // In 3-level: both X and Y get Accept/Decline New Time.
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "PROPOSED NEW TIME") {
    return (
      <div className="flex  items-end gap-1">
        {/* Self-assigned: just propose a different time or proceed */}
        {isSelfAssigned && (
          <>
            {B.inProcess()}
            {B.proposeTime("Change Time")}
            {B.disable()}
            {/* {B.recall()} */}
          </>
        )}

        {/* Y executing (2-level) proposed the time — waiting.
            Assign To removed per spec. Can modify or cancel proposal. */}
        {isYExecuting && !isSelfAssigned && <>{B.proposeTime()}</>}

        {/* Y monitoring (3-level) — Z proposed the time.
            Spec: Y gets Accept New Time, Decline New Time, Recall */}
        {isYMonitoring && (
          <>
            {B.acceptTime()}
            {B.declineTime()}
            {B.recall()}
          </>
        )}

        {/* Z proposed the time — waiting.
            Assign To removed per spec. Can modify or cancel. */}
        {isDelegateZ && <>{B.proposeTime()}</>}

        {/* X: Accept New Time, Decline New Time + persistent controls */}
        {isAssignerX && !isSelfAssigned && (
          <>
            {B.acceptTime()}
            {B.declineTime()}
            {B.disable()}
            {B.complete()}
            {/* {B.recall()} */}
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // IN PROCESS
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "IN PROCESS") {
    return (
      <div className="flex  items-end gap-1">
        {/* Self-assigned: Done (immediate complete), Assign To, Propose New Time */}
        {isSelfAssigned && (
          <>
            {B.complete()}
            {B.assignTo()}
            {B.disable()}
            {B.proposeTime("Change Time")}

            {/* {B.recall()} */}
          </>
        )}

        {/* Y executing (2-level): Assign To, Done, Propose New Time */}
        {isYExecuting && (
          <>
            {B.done()}
            {B.assignTo()}
            {B.proposeTime()}
          </>
        )}

        {/* Y monitoring (3-level — Z is in process):
            Spec: Assign To, Recall */}
        {isYMonitoring && (
          <>
            {B.assignTo()}
            {/* {B.recall()} */}
          </>
        )}

        {/* Z in process: Assign To, Done, Propose New Time */}
        {isDelegateZ && (
          <>
            {B.assignTo()}
            {B.done()}
            {B.proposeTime()}
          </>
        )}

        {/* X: Assign To, Disable, Complete, Recall */}
        {isAssignerX && !isSelfAssigned && xPersistent()}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // IN REVIEW
  //
  // 2-level:  Y Done → X reviews.
  //           X: Complete, Decline Review, Disable, Recall
  //           Z: nothing
  //
  // 3-level phase A — Z clicked Done, both X and Y are in review:
  //           X: Complete, Decline Review, Disable, Recall
  //           Y: Done (escalates to X), Decline Review
  //           Z: nothing
  //
  // 3-level phase B — Y clicked Done, X is the sole reviewer:
  //           X: Complete, Decline Review, Disable, Recall
  //           Y: nothing
  //           Z: nothing
  //
  // We distinguish phase A vs B by whether Y still has pending review actions.
  // The backend must tell us this via the task's state. For now we use
  // isDelegateZ to infer: if Z exists and status is IN REVIEW, Y is still
  // in the review chain (phase A) until they submit Done.
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "IN REVIEW") {
    return (
      <div className="flex  items-end gap-1">
        {/* Self-assigned In Review — shouldn't normally occur, but handle gracefully */}
        {isSelfAssigned && (
          <>
            {B.complete()}
            {B.disable()}
            {/* {B.recall()} */}
          </>
        )}

        {/* Y monitoring (3-level phase A): Done escalates to X, or Decline Review */}
        {isYMonitoring && (
          <>
            {B.yDoneReview()}
            {B.declineReview()}
          </>
        )}

        {/* Z: always nothing in In Review */}
        {isDelegateZ && !isAssignerX && !isAssigneeY && (
          <div className="text-xs text-slate-400">Awaiting review</div>
        )}

        {/* X: Complete, Decline Review, Disable, Recall */}
        {isAssignerX && !isSelfAssigned && (
          <>
            {B.complete()}
            {B.declineReview()}
            {B.disable()}
            {/* {B.recall()} */}
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fallback — unknown status, render nothing
  // ─────────────────────────────────────────────────────────────────────────
  return <div className="flex items-center gap-1" />;
};
