export type TaskQRequestParam =
  | "GetAllCounts"
  | "GetCountbyTaskType"
  | "GetInboxTasks"
  | "GetSentTasks"
  | "GetDueTodayTasks"
  | "GetUnreadTasks"
  | "GetPastDueTasks"
  | "GetToDoTasks"
  | "GetCompletedTasks"
  | "GetDisabledTasks"
  | "GetTasksByCategoryCount"
  | "GetCountByTaskList"
  | "GetTasksByCategory"
  | "GetUsers"
  | "GetCategory"
  | "UpdateReadStatus";

//sidebar folder count
export interface AllCounts {
  InboxCount: number;
  SentCount: number;
  DueTodayCount: number;
  UnreadCount: number;
  PastDueCount: number;
  TodoCount: number;
  CompletedCount: number;
  DisabledCount: number;
}

export interface TaskTypeCount {
  TaskTypeID: string;
  TaskTypeName: string;
  CompletedCount: string;
  PendingCount: string;
}

export interface CategoryCount {
  TypeID: string;
  TaskType: string;
  TaskCount: number;
}

export interface TaskCategory {}

export interface UpdateRead {
  TaskID: number;
}

export interface Category {
  TaskTypeID: string;
  TaskTypeName: string;
}

export interface Users {
  UserID: number;
  NodeUserID: string | null;

  UserName: string;
  UserEmail: string;
}

export interface Task {
  TaskID: string;
  TaskDescription: string;
  CreatorUserID: string;
  AssignedByUserID: string;
  CurrentOwnerUserID: string | null;
  AssignedBy: string;
  TaskTitle: string;
  TaskDueDate: string;
  CurrentOwner: string;
  TaskCreator: string;
  Priority: string;
  TaskType: string;
  StatusName: string;
  IsRead: boolean;
  TaskCreatedOn: string;
  TaskUpdateTime: string;
}

export type Inbox = Task;
export type Sent = Task;
export type DueToday = Task;
export type Unread = Task;
export type PastDue = Task;
export type ToDo = Task;
export type Completed = Task;
export type Disabled = Task;
