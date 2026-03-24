"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  Calendar as CalendarIcon,
  CheckSquare,
  Paperclip,
  MapPin,
  Check,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { toast } from "sonner";
import { AddTaskChecklist } from "./AddTaskCheckList";
import { AddTaskAttachments } from "./AddTaskAttachments";

const EditTaskForm = ({
  task,
  onClose,
}: {
  task: any;
  onClose: () => void;
}) => {
  const {
    users,
    categories,
    editTask,
    checklist,
    addChecklistItem,
    deleteCheckItem,
    toggleCheckItem,
  } = useTaskQ();

  // --- Form States ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    task.TaskDueDate ? new Date(task.TaskDueDate) : undefined,
  );
  const [timeValue, setTimeValue] = useState<string>(
    task.TaskDueDate ? format(new Date(task.TaskDueDate), "HH:mm") : "12:00",
  );
  const [activeTab, setActiveTab] = useState<"checklist" | "attachments">(
    "checklist",
  );
  const [formData, setFormData] = useState({
    TaskTitle: task.TaskTitle || "",
    TaskDescription: task.TaskDescription || "",
    CommentText: "",

    AssignToUserID: String(
      task.CurrentOwnerAspNetUserID ||
        task.TaskCurrentOwnerID ||
        task.AssignToUserID ||
        "",
    ),
    Location: task.TaskLocation || task.Location || "Remote",
    GroupID: task.UserGroupID || task.GroupID || "",
    TaskTypeID: String(task.TaskTypeID || ""),
  });

  // --- Checklist & Attachments Local States ---
  const [newDraftItems, setNewDraftItems] = useState<string[]>([]);

  const [currentCheckItem, setCurrentCheckItem] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // --- UI Search/Dropdown States ---
  const [userSearch, setUserSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [highlightedCategoryIndex, setHighlightedCategoryIndex] = useState(0);
  const [highlightedUserIndex, setHighlightedUserIndex] = useState(0);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  useEffect(() => setHighlightedCategoryIndex(0), [categorySearch]);
  useEffect(() => setHighlightedUserIndex(0), [userSearch]);

  const apiChecklistForThisTask = useMemo(() => {
    return checklist.filter(
      (item) => String(item.TaskID) === String(task.TaskID),
    );
  }, [checklist, task.TaskID]);

  const combinedChecklist = useMemo(() => {
    return [...apiChecklistForThisTask, ...newDraftItems];
  }, [apiChecklistForThisTask, newDraftItems]);

  // Auto-match category
  useEffect(() => {
    if (task.TaskType && !formData.TaskTypeID) {
      const matched = categories?.find((c) => c.TaskTypeName === task.TaskType);
      if (matched)
        setFormData((p) => ({
          ...p,
          TaskTypeID: matched.TaskTypeID.toString(),
        }));
    }
  }, [categories, task.TaskType]);

  const filteredCategories = useMemo(() => {
    return [...(categories || [])]
      .filter((c) =>
        c.TaskTypeName.toLowerCase().includes(categorySearch.toLowerCase()),
      )
      .sort((a, b) => a.TaskTypeName.localeCompare(b.TaskTypeName));
  }, [categories, categorySearch]);

  const filteredUsers = useMemo(() => {
    return [...(users || [])]
      .filter((u) =>
        u.UserName.toLowerCase().includes(userSearch.toLowerCase()),
      )
      .sort((a, b) => a.UserName.localeCompare(b.UserName));
  }, [users, userSearch]);

  const selectedCategoryName = categories?.find(
    (c) => c.TaskTypeID.toString() === formData.TaskTypeID,
  )?.TaskTypeName;

  const selectedUserName = users?.find(
    (u) =>
      u.UserID.toString() === formData.AssignToUserID ||
      u.AspNetUserID === formData.AssignToUserID,
  )?.UserName;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map(Number);
    selectedDate.setHours(hours, minutes);
    setDate(selectedDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const updatedDate = new Date(date);
      updatedDate.setHours(hours, minutes);
      setDate(updatedDate);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    list: any[],
    currentIndex: number,
    setIndex: (i: number) => void,
    onSelect: (item: any) => void,
  ) => {
    if (list.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((currentIndex + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((currentIndex - 1 + list.length) % list.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSelect(list[currentIndex]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    const userObj = users?.find(
      (u) =>
        u.UserID.toString() === formData.AssignToUserID ||
        u.AspNetUserID === formData.AssignToUserID,
    );

    const payload = {
      TaskID: Number(task.TaskID),
      TaskTitle: formData.TaskTitle,
      TaskDescription: formData.TaskDescription,
      DueDate: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "",
      AssignToUserID: userObj
        ? userObj.UserID
        : Number(formData.AssignToUserID),
      TaskTypeID: Number(formData.TaskTypeID) || 2,
      GroupID: formData.GroupID ? Number(formData.GroupID) : null,
      Location: formData.Location || "Remote",
      CommentText: "Task details updated",
    };

    try {
      const success = await editTask(payload, newDraftItems);
      if (success) {
        toast.success("Task Updated!", { id: "edit-task" });
        setNewDraftItems([]);
        onClose();
      }
    } catch (err) {
      toast.error("Failed to update task", { id: "edit-task" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-xs font-semibold text-slate-700";

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Edit Task
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4  space-y-2">
        <div className=" grid gap-2 grid-cols-12">
          <div className="col-span-12 space-y-1">
            <label className={labelStyle}>
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.TaskTitle}
              onChange={(e) =>
                setFormData({ ...formData, TaskTitle: e.target.value })
              }
              className="h-7 rounded-xl border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1 col-span-4">
            <label className={labelStyle}>
              Due Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-7 w-full px-3 justify-between overflow-x-auto overflow-y-hidden custom-scrollbar-hide font-normal border-slate-200 rounded-xl text-xs",
                    !date && "text-slate-400",
                  )}
                >
                  {date
                    ? format(date, "MMM d, yyyy h:mm a")
                    : "Select date & time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto z-[999] scale-75" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
                <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
                  <span className="text-sm text-slate-700 font-medium">
                    Time
                  </span>
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="h-6 w-[90px] rounded-lg text-xs bg-white"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1 col-span-4">
            <label className={labelStyle}>
              Assign To <span className="text-red-500">*</span>
            </label>
            <Popover open={isUserOpen} onOpenChange={setIsUserOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-7 w-full justify-between px-3 rounded-xl border-slate-200 text-xs font-normal"
                >
                  <span className="truncate">
                    {selectedUserName || "Select User"}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[180px] z-[999]  p-0 rounded-xl shadow-xl"
                align="start"
              >
                <div className="flex items-center px-3 py-2 border-b">
                  <input
                    autoFocus
                    placeholder="Search users..."
                    className="flex-1 bg-transparent text-xs outline-none"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        filteredUsers,
                        highlightedUserIndex,
                        setHighlightedUserIndex,
                        (u) => {
                          setFormData({
                            ...formData,
                            AssignToUserID: u.UserID.toString(),
                          });
                          setUserSearch("");
                          setIsUserOpen(false);
                        },
                      )
                    }
                  />
                </div>
                <ScrollArea className="h-44">
                  <div className="p-1">
                    {filteredUsers.map((u, i) => (
                      <div
                        key={u.UserID}
                        className={cn(
                          "flex items-center justify-between px-2 py-1 text-xs rounded-lg cursor-pointer",
                          highlightedUserIndex === i
                            ? "bg-slate-100 text-[#30493b] font-semibold"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            AssignToUserID: u.UserID.toString(),
                          });
                          setUserSearch("");
                          setIsUserOpen(false);
                        }}
                      >
                        {u.UserName}
                        {formData.AssignToUserID === u.UserID.toString() && (
                          <Check size={14} className="text-[#30493b]" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1 col-span-4">
            <label className={labelStyle}>Category</label>
            <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-7 w-full justify-between px-3 rounded-xl border-slate-200 text-xs font-normal"
                >
                  <span className="truncate">
                    {selectedCategoryName || "Select"}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[150px] z-[999]  p-0 rounded-xl shadow-xl"
                align="end"
              >
                <div className="flex items-center px-3 py-2 border-b">
                  <input
                    autoFocus
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-xs outline-none"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        filteredCategories,
                        highlightedCategoryIndex,
                        setHighlightedCategoryIndex,
                        (c) => {
                          setFormData({
                            ...formData,
                            TaskTypeID: c.TaskTypeID.toString(),
                          });
                          setCategorySearch("");
                          setIsCategoryOpen(false);
                        },
                      )
                    }
                  />
                </div>
                <ScrollArea className="h-44">
                  <div className="p-1">
                    {filteredCategories.map((c, i) => (
                      <div
                        key={c.TaskTypeID}
                        className={cn(
                          "flex items-center justify-between px-2 py-1 text-xs rounded-lg cursor-pointer",
                          highlightedCategoryIndex === i
                            ? "bg-slate-100 text-[#30493b] font-semibold"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            TaskTypeID: c.TaskTypeID.toString(),
                          });
                          setCategorySearch("");
                          setIsCategoryOpen(false);
                        }}
                      >
                        {c.TaskTypeName}
                        {formData.TaskTypeID === c.TaskTypeID.toString() && (
                          <Check size={14} className="text-[#30493b]" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Row 3: Location & Group ID */}
          <div className="space-y-1 col-span-6">
            <label className={labelStyle}>Location</label>
            <div className="relative">
              <Input
                value={formData.Location}
                onChange={(e) =>
                  setFormData({ ...formData, Location: e.target.value })
                }
                placeholder="Location"
                className="h-7 rounded-xl pr-10 border-slate-200 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-slate-100 rounded-lg"
              >
                <MapPin size={14} className="text-slate-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-1 col-span-6">
            <label className={labelStyle}>Group ID</label>
            <Input
              value={formData.GroupID}
              onChange={(e) =>
                setFormData({ ...formData, GroupID: e.target.value })
              }
              placeholder="Optional"
              className="h-7 rounded-xl border-slate-200 text-xs"
            />
          </div>

          {/* Row 4: Description */}
          <div className="space-y-1 col-span-12">
            <label className={labelStyle}>Description</label>
            <Textarea
              value={formData.TaskDescription}
              onChange={(e) =>
                setFormData({ ...formData, TaskDescription: e.target.value })
              }
              placeholder="Add more details..."
              className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-[#30493b] text-xs"
            />
          </div>
        </div>

        {/* --- Tabs Section --- */}
        <div className="pt-2">
          <div className="flex gap-6 border-b">
            <button
              onClick={() => setActiveTab("checklist")}
              className={cn(
                "pb-2 text-xs font-bold flex items-center gap-2",
                activeTab === "checklist"
                  ? "text-slate-900 border-b-2 border-[#30493b]"
                  : "text-slate-400",
              )}
            >
              <CheckSquare size={16} /> Checklist (
              {apiChecklistForThisTask.length})
            </button>
            <button
              onClick={() => setActiveTab("attachments")}
              className={cn(
                "pb-2 text-xs font-bold flex items-center gap-2",
                activeTab === "attachments"
                  ? "text-slate-900 border-b-2 border-[#30493b]"
                  : "text-slate-400",
              )}
            >
              <Paperclip size={16} /> Attachments ({attachedFiles.length})
            </button>
          </div>

          {activeTab === "checklist" ? (
            <AddTaskChecklist
              items={combinedChecklist}
              newItem={currentCheckItem}
              setNewItem={setCurrentCheckItem}
              onAdd={async () => {
                if (currentCheckItem.trim()) {
                  setNewDraftItems((prev) => [...prev, currentCheckItem]);
                  setCurrentCheckItem("");
                }
              }}
              onRemove={(index, id) => {
                if (id) {
                  deleteCheckItem(String(id), task.TaskID);
                } else {
                  const draftIndex = index - apiChecklistForThisTask.length;
                  setNewDraftItems((prev) =>
                    prev.filter((_, i) => i !== draftIndex),
                  );
                }
              }}
              onToggle={(index, id, status) => {
                if (id) toggleCheckItem(String(id), task.TaskID, !!status);
              }}
            />
          ) : (
            <AddTaskAttachments
              files={attachedFiles}
              onAdd={(f) =>
                f && setAttachedFiles([...attachedFiles, ...Array.from(f)])
              }
              onRemove={(i) =>
                setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))
              }
            />
          )}
        </div>
      </div>

      <div className="p-3 border-t flex justify-start gap-4 bg-white shrink-0">
        <Button
          onClick={onClose}
          variant="ghost"
          className="h-8 rounded-xl font-bold text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-[#1e2f25] h-8 rounded-xl font-bold text-white shadow-md text-xs px-6"
        >
          {isSubmitting ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
