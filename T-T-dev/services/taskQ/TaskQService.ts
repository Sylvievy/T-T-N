import { postRequest } from "../apiConfig";
import {
  AllCounts,
  TaskTypeCount,
  CategoryCount,
  Category,
  Users,
  Inbox,
  Sent,
  Unread,
  ToDo,
  Completed,
  Disabled,
  UpdateRead,
} from "./TaskQParams";
import {
  TaskLog,
  AddTaskParams,
  Checklist,
  EditTaskParams,
  DeleteChecklistParams,
  FeedbackLog,
  AddTaskQFeedbackParams,
  UpdateChecklistStatusParams,
  UpdateTaskStatusParams,
} from "../GlobalParams";
import { json } from "stream/consumers";
export const GetAllCounts = () => postRequest<AllCounts[]>("GetAllCounts");

// Gets counts grouped by Task Type
export const GetCountbyTaskType = () =>
  postRequest<TaskTypeCount[]>("GetCountbyTaskType");

// Gets counts for specific categories
export const GetTasksByCategoryCount = () =>
  postRequest<CategoryCount[]>("GetTasksByCategoryCount");

export const GetUsers = () => postRequest<Users[]>("GetUsers");

// Gets list of task categories
export const GetCategory = () => postRequest<Category[]>("GetCategory");

// TASK LISTS
export const GetCountByTaskList = () =>
  postRequest<TaskLog[]>("GetCountByTaskList");

// --- FOLDERS ---

export const GetInboxTasks = () => postRequest<Inbox[]>("GetInboxTasks");

export const GetSentTasks = () => postRequest<Sent[]>("GetSentTasks");

export const GetUnreadTasks = () => postRequest<Unread[]>("GetUnreadTasks");

export const GetCompletedTasks = () =>
  postRequest<Completed[]>("GetCompletedTasks");

export const GetDisabledTasks = () =>
  postRequest<Disabled[]>("GetDisabledTasks");

export const GetToDoTasks = () => postRequest<ToDo[]>("GetToDoTasks");

export const GetDueTodayTasks = () => postRequest<Inbox[]>("GetDueTodayTasks");

export const GetPastDueTasks = () => postRequest<Inbox[]>("GetPastDueTasks");

// --- CHECKLIST SERVICES ---

export const GetCheckListItems = (taskId: string) =>
  postRequest<Checklist[]>("GetCheckListItems", { TaskID: taskId });

export const AddChecklist = async (payload: any) => {
  return await postRequest<any>("AddChecklist", { json: payload }, "adddata");
};

export const UpdateChecklistItemStatus = (
  checklistItemId: string,
  isCompleted: boolean,
) => {
  const payload: UpdateChecklistStatusParams = {
    CheckListItemID: parseInt(checklistItemId),
    ItemIsCompleted: isCompleted ? 1 : 0,
  };

  return postRequest<any>(
    "UpdateChecklistItemStatus",
    { json: payload },
    "updatedata",
  );
};

export const DeleteChecklistItem = (checklistItemId: string) => {
  const payload = {
    json: [{ CheckListItemID: Number(checklistItemId) }],
  };

  return postRequest<any>("DeleteChecklistItem", payload, "deletedata");
};

// --- TASK STATUS SERVICES ---

export const AddTask = async (params: AddTaskParams) => {
  return await postRequest<any>("AddTask", { json: params }, "adddata");
};

export const EditTask = async (params: EditTaskParams) => {
  return await postRequest<any>("EditTask", { json: params }, "updatedata");
};

export const UpdateTaskStatus = (params: UpdateTaskStatusParams) => {
  return postRequest<any>("UpdateTaskStatus", { json: params }, "updatedata");
};

export const UpdateReadStatus = (params: UpdateRead) => {
  return postRequest<any>("UpdateReadStatus", { json: params }, "updatedata");
};

// --- FEEDBACK ---
// Add to TaskQService.ts

export const GetTaskQFeedback = () =>
  postRequest<FeedbackLog[]>("GetTasQFeedBack", {}, "data");

export const AddTaskQFeedback = (params: AddTaskQFeedbackParams) => {
  return postRequest<any>("AddTasQFeedBack", { json: params }, "adddata");
};
