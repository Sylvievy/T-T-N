"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as taskQService from "./TaskQService";
import * as dashboardService from "../dashboard/DashboardService";
import {
  AllCounts,
  TaskQRequestParam,
  Users,
  Category,
  CategoryCount,
  Inbox,
} from "./TaskQParams";
import {
  TaskLog,
  EditTaskParams,
  AddTaskParams,
  Checklist,
  FeedbackLog,
} from "../GlobalParams";
import { Comments } from "../dashboard/DashboardParams";

export const useTaskQData = (activeFolder: TaskQRequestParam) => {
  const [data, setData] = useState({
    counts: {} as AllCounts,
    categoryCounts: [] as CategoryCount[],
    tasks: [] as (Inbox | TaskLog)[],
    checklist: [] as Checklist[],
    loading: true,
    comments: [] as Comments[],
    error: null as string | null,
    users: [] as Users[],
    categories: [] as Category[],
    feedback: [] as FeedbackLog[],
  });

  const [selectedTask, setSelectedTask] = useState<Inbox | TaskLog | null>(
    null,
  );
  const fetchCounts = useCallback(async () => {
    try {
      const countsResult = await taskQService.GetAllCounts();
      setData((prev) => ({
        ...prev,
        counts: countsResult[0] || ({} as AllCounts),
      }));
    } catch (err) {
      console.error("Failed to fetch sidebar counts:", err);
    }
  }, []);
  const fetchFolderData = useCallback(
    async (param: TaskQRequestParam, id?: string) => {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const fetchFunction = taskQService[param as keyof typeof taskQService];
        if (typeof fetchFunction !== "function")
          throw new Error(`Service ${param} not found`);

        let result;
        if (param === "GetTasksByCategory") {
          result = await (fetchFunction as (id: string) => Promise<any>)(
            id || "",
          );
        } else {
          result = await (fetchFunction as () => Promise<any>)();
        }

        const tasks = (result || []).map(normalizeTask);
        setData((prev) => ({ ...prev, tasks, loading: false }));
        return tasks; // ← return so refreshFolder can use it
      } catch (err) {
        setData((prev) => ({
          ...prev,
          error: "Failed to fetch data",
          loading: false,
        }));
        return [];
      }
    },
    [],
  );
  const refreshFolder = useCallback(async () => {
    const [freshTasks] = await Promise.all([
      fetchFolderData(activeFolder),
      fetchCounts(),
    ]);

    setSelectedTask((prev) => {
      if (!prev) return prev;
      const updated = freshTasks.find(
        (t: Inbox | TaskLog) => String(t.TaskID) === String(prev.TaskID),
      );
      return updated ? normalizeTask(updated) : prev;
    });
  }, [activeFolder, fetchFolderData, fetchCounts]);
  const submitFeedback = useCallback(
    async (description: string, page: string) => {
      try {
        const success = await taskQService.AddTaskQFeedback({
          FeedBackDescription: description,
          FeedBackPage: page,
        });

        if (success) {
          const res = await taskQService.GetTaskQFeedback();
          setData((prev) => ({ ...prev, feedback: res || [] }));
          return true;
        }
        return false;
      } catch (err) {
        console.error("Feedback error:", err);
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await taskQService.GetTaskQFeedback();
        setData((prev) => ({ ...prev, feedback: res || [] }));
      } catch (err) {
        console.error("Failed to fetch feedback", err);
      }
    };
    fetchFeedback();
  }, []);

  const fetchCategoryCounts = useCallback(async () => {
    try {
      const res = await taskQService.GetTasksByCategoryCount();
      setData((prev) => ({ ...prev, categoryCounts: res || [] }));
    } catch (err) {
      console.error("Failed to fetch category counts", err);
    }
  }, []);

  const fetchMetadata = useCallback(async () => {
    try {
      const [usersRes, catsRes] = await Promise.all([
        taskQService.GetUsers(),
        taskQService.GetCategory(),
      ]);
      setData((prev) => ({
        ...prev,
        users: usersRes || [],
        categories: catsRes || [],
      }));
    } catch (err) {
      console.error("Failed to fetch form metadata", err);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      const res = await dashboardService.GetComments();
      setData((prev) => ({ ...prev, comments: res }));
      await refreshFolder();
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, []);

  const fetchChecklist = useCallback(async (taskId: string) => {
    try {
      const res = await taskQService.GetCheckListItems(taskId);
      setData((prev) => ({ ...prev, checklist: res || [] }));
    } catch (err) {
      console.error("Failed to fetch checklist", err);
    }
  }, []);

  const addChecklistBatch = useCallback(
    async (taskId: string | number, items: string[]) => {
      if (items.length === 0) return true;
      try {
        const payload = items.map((text) => ({
          TaskID: Number(taskId),
          ItemText: text,
          ItemMetaData: null,
        }));

        const result = await taskQService.AddChecklist(payload);

        if (result) {
          await fetchChecklist(String(taskId));
          return true;
        }
        return false;
      } catch (err) {
        console.error("Batch checklist error:", err);
        return false;
      }
    },
    [fetchChecklist],
  );

  const addChecklistItem = useCallback(
    async (taskId: string, text: string) => {
      // Just wrap the single string in an array and use the batch function
      return await addChecklistBatch(taskId, [text]);
    },
    [addChecklistBatch],
  );

  const deleteCheckItem = useCallback(
    async (checklistItemId: string, taskId: string) => {
      try {
        const result = await taskQService.DeleteChecklistItem(checklistItemId);
        // Checking for processCode 0 based on your Postman screenshot
        if (
          result &&
          (result.processCode === 0 || result.data?.processCode === 0)
        ) {
          await fetchChecklist(taskId);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Delete checklist item error:", err);
        return false;
      }
    },
    [fetchChecklist],
  );

  const toggleCheckItem = useCallback(
    async (checklistItemId: string, taskId: string, currentStatus: boolean) => {
      setData((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          String(item.CheckListItemID) === checklistItemId
            ? { ...item, ItemIsCompleted: !currentStatus }
            : item,
        ),
      }));

      await taskQService.UpdateChecklistItemStatus(
        checklistItemId,
        !currentStatus,
      );
    },
    [], // Removed fetchChecklist dependency to prevent unwanted refreshes
  );

  const addComment = useCallback(
    async (taskId: string, text: string) => {
      try {
        const success = await dashboardService.InsertComment({
          TaskID: parseInt(taskId),
          CommentText: text,
        });

        if (success) {
          await fetchComments();
          await refreshFolder();

          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    [fetchComments],
  );

  // TaskQData.tsx

  const addTask = useCallback(
    async (params: AddTaskParams, checklistItems: string[]) => {
      try {
        const result = await taskQService.AddTask(params);

        if (result && result.processCode === 0) {
          const message = result.message || "";
          const match = message.match(/\d+$/);
          const newTaskID = match ? match[0] : null;

          if (newTaskID && checklistItems.length > 0) {
            await addChecklistBatch(newTaskID, checklistItems);
          }
          await refreshFolder();
          return true;
        }
        return false;
      } catch (err) {
        console.error("Add Task Error:", err);
        return false;
      }
    },
    [refreshFolder],
  );

  const updateReadStatus = useCallback(
    async (taskId: number | string) => {
      const numericId = Number(taskId); // Normalize
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          Number(t.TaskID) === taskId ? { ...t, IsRead: true, IsUnread: 0 } : t,
        ),
      }));

      try {
        const res = await taskQService.UpdateReadStatus({ TaskID: numericId });

        if (res && (res.processCode === 0 || res.data?.processCode === 0)) {
          fetchCounts();
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to update read status", err);
        return false;
      }
    },
    [fetchCounts],
  );

  const updateTaskStatus = useCallback(
    async (
      taskId: string,
      action: string,
      comment?: string,
      extraParams: Record<string, any> = {},
    ) => {
      const res = await taskQService.UpdateTaskStatus({
        TaskID: Number(taskId),
        Action: action,
        CommentText: comment ?? "",
        ...extraParams,
      });

      if (res && (res.processCode === 0 || res.data?.processCode === 0)) {
        await refreshFolder();
        await fetchComments();

        setSelectedTask((prev: any) => {
          if (!prev || String(prev.TaskID) !== String(taskId)) return prev;

          const updatedTask = { ...prev };

          if (action === "AcceptTask") updatedTask.StatusName = "Accepted";
          if (action === "InProcess") updatedTask.StatusName = "In Process";
          if (action === "CompleteForReview")
            updatedTask.StatusName = "In Review";
          if (action === "ReviewAccept") updatedTask.StatusName = "Completed";
          if (action === "ReviewDecline") updatedTask.StatusName = "In Process";
          if (action === "ReAssignTask" && extraParams.AssignToUserID) {
            updatedTask.StatusName = "Assigned";
            updatedTask.TaskCurrentOwnerID = String(extraParams.AssignToUserID);
          }
          if (action === "ProposeNewTime" && extraParams.NewDueDate) {
            updatedTask.TaskDueDate = extraParams.NewDueDate.split(" ")[0];
          }
          if (action === "FinalComplete") updatedTask.StatusName = "Completed";
          if (action === "DeclineTask") updatedTask.StatusName = "Declined";
          if (action === "RecallTask") updatedTask.StatusName = "Assigned";
          if (action === "DisableTask") updatedTask.StatusName = "Disabled";

          return updatedTask;
        });

        return true;
      }
      return false;
    },
    [refreshFolder, fetchComments, setSelectedTask],
  );

  // Normalize any task shape into consistent fields for role resolution
  const normalizeTask = (task: any) => ({
    ...task,
    _creatorId: task.CreatorUserID ?? null,
    _currentOwnerId: task.CurrentOwnerUserID ?? null,
    _nextOwnerId: task.NextOwnerAspNetUserID ?? null,
  });

  const editTask = useCallback(
    async (params: EditTaskParams, newChecklistItems: string[] = []) => {
      try {
        const res = await taskQService.EditTask(params);

        if (res && res.processCode === 0) {
          if (newChecklistItems.length > 0) {
            await addChecklistBatch(params.TaskID, newChecklistItems);
          }

          await refreshFolder();
          await fetchComments();
          setSelectedTask((prev: any) => {
            if (!prev || String(prev.TaskID) !== String(params.TaskID))
              return prev;
            return {
              ...prev,
              TaskTitle: params.TaskTitle,
              TaskDescription: params.TaskDescription,
              TaskDueDate: params.DueDate,
              TaskCurrentOwnerID: String(params.AssignToUserID),
              TaskTypeID: String(params.TaskTypeID),
              TaskLocation: params.Location,
            };
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to edit task:", err);
        return false;
      }
    },
    [refreshFolder, setSelectedTask, fetchComments],
  );

  // Add this ref at the top of useTaskQData
  const hasInitialized = useRef(false);

  useEffect(() => {
    // STRICT GUARD: If we already started initializing, do nothing.
    if (hasInitialized.current) return;

    const token = localStorage.getItem("taskQ_bearer_token");
    if (!token) return;

    hasInitialized.current = true;

    const bootStrap = async () => {
      try {
        // 1. Get Sidebar Counts FIRST (Fastest)
        await fetchCounts();

        // 2. Add a literal gap (300ms) to let the server breathe
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 3. Get Metadata (Users/Categories)
        await fetchMetadata();

        // 4. Everything else can be bundled or slightly delayed
        setTimeout(() => {
          fetchCategoryCounts();
          fetchComments();
          // fetchFeedback(); // If you have this
        }, 500);
      } catch (err) {
        console.error("Bootstrap failed:", err);
        // Reset if it failed so user can try again on refresh
        hasInitialized.current = false;
      }
    };

    bootStrap();
  }, []); // Empty dependency array
  useEffect(() => {
    // Only fetch folder data if we aren't currently "bootstrapping"
    if (hasInitialized.current) {
      fetchFolderData(activeFolder);
    }
  }, [activeFolder]);
  return {
    ...data,
    selectedTask,
    setSelectedTask,
    fetchFolderData,
    refreshCounts: fetchCounts,
    refreshCategoryCounts: fetchCategoryCounts,
    addComment,
    fetchMetadata,
    fetchChecklist,
    addChecklistItem,
    addChecklistBatch,
    deleteCheckItem,
    toggleCheckItem,
    refreshFolder,
    updateTaskStatus,
    editTask,
    addTask,
    updateReadStatus,
    submitFeedback,
  };
};
