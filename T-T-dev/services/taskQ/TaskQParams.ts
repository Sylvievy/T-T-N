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
  | "GetTasksByCategory"
  | "GetUsers"
  | "GetCountByTaskList"
  | "GetCategory"
  | "UpdateReadStatus";

//sidebar folder count
export interface AllCounts {
  InboxCount: string;
  SentCount: string;
  DueTodayCount: string;
  UnreadCount: string;
  PastDueCount: string;
  TodoCount: string;
  CompletedCount: string;
  DisabledCount: string;
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
  TaskCount: string;
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
  UserName: string;
  UserEmail: string;
  CountryCode: string;
  MobileNumber: string;
  AspNetUserID: string | null;
}

export interface Task {
  TaskID: string;
  TaskDescription: string;
  CreatorAspNetUserID: string;
  AssignedByAspNetUserID: string;
  CurrentOwnerAspNetUserID: string | null;
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
