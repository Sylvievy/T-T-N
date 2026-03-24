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

const AddTaskForm = () => {
  const { setIsAddingTask, users, categories, addTask } = useTaskQ();

  // --- Form States ---
  const [date, setDate] = useState<Date>();
  const [timeValue, setTimeValue] = useState<string>("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"checklist" | "attachments">(
    "checklist",
  );

  const [formData, setFormData] = useState({
    TaskTitle: "",
    TaskDescription: "",
    AssignToUserID: "",
    Location: "",
    GroupID: "",
    TaskTypeID: "",
  });

  // --- Checklist & Attachments States ---
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
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

  // --- Helpers ---
  const handleAddChecklistItem = () => {
    if (currentCheckItem.trim()) {
      setChecklistItems((prev) => [...prev, currentCheckItem]);
      setCurrentCheckItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

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
    (u) => u.UserID.toString() === formData.AssignToUserID,
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

  const isFormValid =
    formData.TaskTitle.trim() !== "" &&
    date !== undefined &&
    formData.AssignToUserID !== "";

  // --- Save Logic (Strictly "Add") ---
  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    const myUserId = localStorage.getItem("taskQ_asp_net_user_id");
    const toastId = "add-task-action";

    const payload = {
      TaskTitle: formData.TaskTitle,
      TaskDescription: formData.TaskDescription,
      DueDate: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "",
      AssignToUserID: Number(formData.AssignToUserID),
      TaskTypeID: Number(formData.TaskTypeID) || 2,
      GroupID: formData.GroupID ? Number(formData.GroupID) : null,
      Location: formData.Location || "Remote",
      CreatedByUserID: myUserId ? Number(myUserId) : 1,
    };

    try {
      toast.loading("Creating task...", { id: toastId });
      const success = await addTask(payload, checklistItems);

      if (success) {
        toast.success("Task Created!", { id: toastId });
        setIsAddingTask(false);
      } else {
        toast.error("Failed to create task", { id: toastId });
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("An error occurred while saving", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      TaskTitle: "",
      TaskDescription: "",
      AssignToUserID: "",
      Location: "",
      GroupID: "",
      TaskTypeID: "",
    });
    setDate(undefined);
    setTimeValue("12:00");
    setChecklistItems([]);
    setAttachedFiles([]);
  };

  const labelStyle = "text-[13px] font-semibold text-slate-700";

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 ">
      <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Add New Task
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAddingTask(false)}
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 space-y-1">
            <label className={labelStyle}>
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.TaskTitle}
              onChange={(e) =>
                setFormData({ ...formData, TaskTitle: e.target.value })
              }
              placeholder="What needs to be done?"
              className="h-7 rounded-xl border-slate-200 text-[13px]"
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
                    "h-7 w-full justify-between text-left overflow-x-auto overflow-y-hidden custom-scrollbar-hide font-normal border-slate-200 rounded-xl text-[13px]",
                    !date && "text-slate-400",
                  )}
                >
                  {date
                    ? format(date, "MMM d, yyyy h:mm a")
                    : "Select date & time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[999] scale-90"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
                <div className="px-3 py-1  flex items-center justify-between gap-2 bg-slate-100">
                  <span className="text-sm text-slate-700 font-medium cursor-default">
                    Time
                  </span>
                  <div className="relative">
                    <Input
                      id="time-input"
                      type="time"
                      value={timeValue}
                      onChange={handleTimeChange}
                      className="h-6 w-[90px] rounded-lg text-xs bg-white cursor-pointer"
                    />
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => {
                        const input = document.getElementById(
                          "time-input",
                        ) as HTMLInputElement;
                        input?.showPicker();
                      }}
                    />
                  </div>
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
                  className="h-7 w-full justify-between px-3 rounded-xl border-slate-200 text-[13px] font-normal"
                >
                  <span className="truncate">
                    {selectedUserName || "Select User"}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[180px] p-0 z-[999] rounded-xl shadow-xl"
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
                  className="h-7 w-full justify-between px-3 rounded-xl border-slate-200 text-[13px] font-normal"
                >
                  <span className="truncate">
                    {selectedCategoryName || "Select"}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[150px] p-0 z-[999] rounded-xl shadow-xl"
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

          <div className="space-y-1 col-span-6">
            <label className={labelStyle}>Location</label>
            <div className="relative">
              <Input
                value={formData.Location}
                onChange={(e) =>
                  setFormData({ ...formData, Location: e.target.value })
                }
                placeholder="Enter location or pin"
                className="h-7 rounded-xl pr-10 border-slate-200 text-[13px]"
              />
              <Button
                type="button"
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
              className="h-7 rounded-xl border-slate-200 text-[13px]"
            />
          </div>

          <div className="space-y-1 col-span-12">
            <label className={labelStyle}>Description</label>
            <Textarea
              value={formData.TaskDescription}
              onChange={(e) =>
                setFormData({ ...formData, TaskDescription: e.target.value })
              }
              placeholder="Add more details about this task..."
              className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-[#30493b] text-[13px]"
            />
          </div>
        </div>

        {/* --- Checklist / Attachments Section --- */}
        <div className="pt-2">
          <div className="flex gap-8 border-b mb-4">
            <button
              onClick={() => setActiveTab("checklist")}
              className={cn(
                "pb-2 text-xs font-bold flex items-center gap-2",
                activeTab === "checklist"
                  ? "text-slate-900 border-b-2 border-[#30493b]"
                  : "text-slate-400",
              )}
            >
              <CheckSquare size={16} /> Checklist ({checklistItems.length})
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
              items={checklistItems}
              newItem={currentCheckItem}
              setNewItem={setCurrentCheckItem}
              onAdd={handleAddChecklistItem}
              onRemove={handleRemoveChecklistItem}
              onToggle={() => {}}
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

      <div className="p-3 border-t flex justify-start  gap-4 bg-white shrink-0">
        <Button
          onClick={handleReset}
          className="bg-[#94a3b8] h-8 rounded-xl font-bold text-xs"
        >
          Clear
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isFormValid || isSubmitting}
          className="bg-[#1e2f25] h-8 rounded-xl font-bold text-white shadow-md text-xs"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddTaskForm;
