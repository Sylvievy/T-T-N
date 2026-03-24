"use client";
import { useMemo, useEffect } from "react";
import { useTaskQData } from "./TaskQData";
import { createContext, useContext, useState, ReactNode } from "react";
import {
  TaskQRequestParam,
  Inbox,
  AllCounts,
  Users,
  Category,
  CategoryCount,
} from "./TaskQParams";
import {
  TaskLog,
  AddTaskParams,
  EditTaskParams,
  Checklist,
  FeedbackLog,
} from "../GlobalParams";
import { Comments } from "../dashboard/DashboardParams";

type LayoutType = "list" | "right" | "bottom" | "popup";

interface TaskQContextType {
  tasks: (Inbox | TaskLog)[];
  loading: boolean;
  error: string | null;
  counts: AllCounts;
  categoryCounts: CategoryCount[];
  fetchFolderData: (param: TaskQRequestParam, id?: string) => Promise<void>;
  refreshCounts: () => Promise<void>;
  refreshCategoryCounts: () => Promise<void>;

  //global add
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (val: boolean) => void;

  quickAddMode: "task" | "feedback" | "note" | null; // New
  setQuickAddMode: (mode: "task" | "feedback" | "note" | null) => void; // New

  //Tasks
  editTask: (
    params: EditTaskParams,
    newChecklistItems?: string[],
  ) => Promise<boolean>;
  addTask: (
    params: AddTaskParams,
    checklistItems: string[],
  ) => Promise<boolean>;
  updateReadStatus: (taskId: number) => Promise<boolean>;

  // Tasks Toggle
  showAllTasks: boolean;
  setShowAllTasks: (val: boolean) => void;

  // Feedback
  feedback: FeedbackLog[];
  submitFeedback: (description: string, page: string) => Promise<boolean>;

  // Navigation state
  activeFolder: TaskQRequestParam;
  setActiveFolder: (folder: TaskQRequestParam) => void;
  selectedTask: Inbox | TaskLog | null;
  setSelectedTask: (task: Inbox | TaskLog | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAddingTask: boolean;
  setIsAddingTask: (val: boolean) => void;
  handleOpenAddTask: () => void;

  // Layout state
  layoutType: LayoutType;
  setLayoutType: (layout: LayoutType) => void;
  preferredLayout: LayoutType;
  openedPopups: (Inbox | TaskLog)[];
  openPopup: (task: Inbox | TaskLog) => void;
  closePopup: (taskId: string | number) => void;

  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Users and Categories
  users: Users[];
  categories: Category[];
  fetchMetadata: () => Promise<void>;
  derivedCategoryCounts: CategoryCount[];
  updateTaskStatus: (
    taskId: string,
    action: string,
    comment?: string,
    extraParams?: Record<string, any>,
  ) => Promise<boolean>;

  //filters
  filters: {
    priority: string[];
    status: string[];
    owner: string[];
    groupBy: string;
    assignedBy: string[];
    sortBy: string;
    sortOrder: "asc" | "desc";
    category: string | null;
    columnFilters: Record<string, string>;
  };
  setFilter: (key: string, value: any) => void;
  setColumnFilter: (columnId: string, value: string) => void;
  resetFilters: () => void;
  refreshFolder: () => void;

  //comments
  comments: Comments[];
  addComment: (taskId: string, text: string) => Promise<boolean>;

  //checklist
  checklist: Checklist[];
  fetchChecklist: (taskId: string) => Promise<void>;
  addChecklistItem: (taskId: string, text: string) => Promise<boolean>;
  addChecklistBatch: (
    taskId: string | number,
    items: string[],
  ) => Promise<boolean>;
  deleteCheckItem: (
    checklistItemId: string,
    taskId: string,
  ) => Promise<boolean>;
  toggleCheckItem: (
    checklistItemId: string,
    taskId: string,
    currentStatus: boolean,
  ) => Promise<void>;
}
const TaskQContext = createContext<TaskQContextType | undefined>(undefined);

export const TaskQProvider = ({ children }: { children: ReactNode }) => {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [activeFolder, setActiveFolder] =
    useState<TaskQRequestParam>("GetInboxTasks");

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<
    "task" | "feedback" | "note" | null
  >(null);
  const [layoutType, setLayoutType] = useState<LayoutType>("right");
  const [preferredLayout, setPreferredLayout] = useState<LayoutType>("right");
  const [openedPopups, setOpenedPopups] = useState<(Inbox | TaskLog)[]>([]);

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const effectiveFolder = showAllTasks ? "GetCountByTaskList" : activeFolder;
  const taskData = useTaskQData(effectiveFolder);

  const handleSetActiveFolder = (folder: TaskQRequestParam) => {
    taskData.setSelectedTask(null); // Changed from setSelectedTask(null)
    setActiveTab("All");
    setActiveFolder(folder);
  };

  useEffect(() => {
    if (taskData.selectedTask && !taskData.selectedTask.IsRead) {
      taskData.updateReadStatus(Number(taskData.selectedTask.TaskID));
    }
  }, [taskData.selectedTask]);

  useEffect(() => {
    if (taskData.selectedTask?.TaskID) {
      taskData.fetchChecklist(taskData.selectedTask.TaskID);
    }
  }, [taskData.selectedTask, taskData.fetchChecklist]);

  const handleSetLayoutType = (layout: LayoutType) => {
    setLayoutType(layout);
    if (layout !== "popup") {
      setPreferredLayout(layout);
    }
  };

  const derivedCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    taskData.tasks.forEach((task) => {
      const name = task.TaskType || "General";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      TaskType: name,
      TaskCount: count.toString(),
      TypeID: name, // Using name as ID for filtering
    })) as CategoryCount[];
  }, [taskData.tasks]);

  const handleCategorySelect = (categoryName: string | null) => {
    setFilter("category", categoryName);
  };
  const handleSetIsAddingTask = (val: boolean) => {
    if (val === false) {
      taskData.setSelectedTask(null);
    }
    setIsAddingTask(val);
  };

  const handleOpenAddTask = () => {
    setQuickAddMode("task");
    setIsQuickAddOpen(true);
  };
  const openPopup = (task: Inbox | TaskLog) => {
    setOpenedPopups((prev) => {
      if (prev.find((t) => t.TaskID === task.TaskID)) return prev;
      return [...prev, task];
    });
    setLayoutType("popup");
  };

  const closePopup = (taskId: string | number) => {
    setOpenedPopups((prev) => {
      const updated = prev.filter((t) => t.TaskID !== taskId);
      // If no more popups are left, return to the preferred layout
      if (updated.length === 0) setLayoutType(preferredLayout);
      return updated;
    });
  };

  const [filters, setFilters] = useState({
    priority: [] as string[],
    status: [] as string[],
    owner: [] as string[],
    assignedBy: [] as string[],
    groupBy: "None",
    sortBy: "TaskUpdateTime",
    sortOrder: "desc" as "asc" | "desc",
    category: null,
    columnFilters: {} as Record<string, string>,
  });

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const setColumnFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      columnFilters: { ...prev.columnFilters, [columnId]: value },
    }));
  };

  const resetFilters = () => {
    setFilters({
      priority: [],
      status: [],
      owner: [],
      assignedBy: [],
      groupBy: "None",
      sortBy: "TaskUpdateTime",
      sortOrder: "desc",
      category: null,
      columnFilters: {},
    });
    setActiveTab("All");
  };

  return (
    <TaskQContext.Provider
      value={{
        ...taskData,
        derivedCategoryCounts,
        isAddingTask,
        setIsAddingTask: handleSetIsAddingTask,
        activeFolder,
        setActiveFolder: handleSetActiveFolder,
        activeTab,
        setActiveTab,
        isQuickAddOpen,
        handleOpenAddTask,
        setIsQuickAddOpen,
        layoutType,
        setLayoutType: handleSetLayoutType,
        preferredLayout,
        isSidebarCollapsed,
        setSidebarCollapsed,
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        setColumnFilter,
        resetFilters,
        showAllTasks,
        setShowAllTasks,
        openedPopups,
        openPopup,
        closePopup,
        quickAddMode,
        setQuickAddMode,
      }}
    >
      {children}
    </TaskQContext.Provider>
  );
};

export const useTaskQ = () => {
  const context = useContext(TaskQContext);
  if (!context) throw new Error("useTaskQ must be used within a TaskQProvider");
  return context;
};
