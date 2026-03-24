export type GlobalParams =
  | "GetCommentsCount"
  | "InsertComment"
  | "GetCountByTaskList"
  | "AddChecklist"
  | "DeleteChecklistItem"
  | "UpdateChecklistItemStatus"
  | "UpdateTaskStatus"
  | "AddTask"
  | "EditTask"
  | "GetTasQFeedBack"
  | "AddTasQFeedBack"
  | "GetCheckListItems";

export interface InsertCommentParams {
  TaskID: number;
  CommentText: string;
}

export interface InsertCommentRequest {
  RequestParamType: "InsertComment";
  json: InsertCommentParams;
}

export interface AddChecklistParams {
  TaskID: number;
  ItemText: string;
  ItemMetaData: null | string;
}

export interface Checklist {
  CheckListItemID: string;
  TaskID: string;
  ItemText: string;
  ItemMetaData: null;
  ItemIsCompleted: boolean;
  CheckListItemIsActive: boolean;
}

export type DeleteChecklistParams = Array<{
  CheckListItemID: number;
}>;

export interface UpdateChecklistStatusParams {
  CheckListItemID: number;
  ItemIsCompleted: 1 | 0;
}

export interface UpdateTaskStatusParams {
  TaskID: number;
  Action: "ReAssignTask" | "ProposeNewTime" | string; // Typehinting the known actions
  CommentText: string;
  AssignToUserID?: number;
  NewDueDate?: string;
}

export interface AddTaskParams {
  TaskTitle: string;
  TaskDescription: string | null;
  DueDate: string;
  AssignToUserID: number;
  TaskTypeID: number;
  GroupID: number | null;
  Location: string;
  CreatedByUserID: number;
}

export interface EditTaskParams extends Omit<AddTaskParams, "CreatedByUserID"> {
  TaskID: number;
  CommentText: string;
}

export interface AddTaskQFeedbackParams {
  FeedBackDescription: string;
  FeedBackPage: string;
}

export interface FeedbackLog {
  FeedBackID: string;
  FeedBackDescription: string;
  FeedBackStatusID: string;
  FeedBackPage: string;
  FeedBackTime: string;
  UserID: string;
  UserEmail: string;
  UserName: string;
}

export interface TaskLog {
  IsPastDue: string;
  IsDueToday: string;
  IsDueTomorrow: string;
  IsUnread: string;
  IsTodo: string;
  AssignedByMe: string;
  MyTaskList: string;

  // Task Details
  TaskID: string;
  TaskTitle: string;
  TaskTitleEncrypted: string | null;
  TaskDescription: string;
  TaskAddress: string | null;
  TaskLocation: string | null;
  CurrentStatus: string;
  TaskCreatedOn: string;
  TaskDueDate: string;
  TaskDueTime: string;
  TaskUpdateTime: string; // Added this

  // Ownership and IDs
  TaskOwnerUserID: string;
  TaskCurrentOwnerID: string;
  TaskNextOwnerID: string | null;
  TaskSecondaryContactUserID: string | null;
  UserGroupID: string | null;

  // ASP.NET User IDs (Updated from AspNetUserId)
  // TaskCurrentOwnerASPNetUserID: string;
  // TaskCreatorASPNetUserID: string;
  // AspNetUserId?: string;
  CreatorASPNetUserID: string; // Added this
  AssignedByASPNetUserID: string; // Added this
  CurrentOwnerASPNetUserID?: string | null; // Kept as optional if used elsewhere

  // Metadata
  TaskPriorityID: string;
  TaskStatusID: string;
  TaskTypeID: string;
  TaskEntryType: string;
  TaskIsAssignable: boolean;
  TaskNewTimeProposed: boolean;
  IsNotificationEnabled: boolean;
  IsRemindable: boolean;
  IsRead: boolean;
  AttachmentCount: string;

  // Display Names
  AssignedBy: string;

  CurrentOwner: string;
  TaskType: string;
  Priority: string;
  StatusName: string;
}
