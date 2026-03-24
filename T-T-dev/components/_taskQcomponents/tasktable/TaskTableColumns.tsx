import { createColumnHelper, ColumnDef } from "@tanstack/react-table";

const columnHelper = createColumnHelper<any>();

export const taskTableColumns: ColumnDef<any, any>[] = [
  columnHelper.accessor("TaskID", {
    header: "ID",
    size: 70,
    minSize: 50,
  }),
  columnHelper.accessor((row) => row.AssignedBy, {
    id: "AssignedBy",
    header: "Assigned By",
    size: 130,
    minSize: 100,
  }),
  columnHelper.accessor("TaskTitle", {
    header: "Title",
    size: 300,
    minSize: 150,
  }),
  columnHelper.accessor("TaskDueDate", {
    header: "Due Date",
    size: 110,
    minSize: 90,
  }),
  columnHelper.accessor("CurrentOwner", {
    header: "Current Owner",
    size: 130,
    minSize: 100,
  }),
  columnHelper.accessor("Priority", {
    header: "Priority",
    size: 80,
    minSize: 70,
  }),
  columnHelper.accessor("TaskType", {
    header: "Category",
    size: 130,
    minSize: 100,
  }),
  columnHelper.accessor("StatusName", {
    header: "Status",
    size: 120,
    minSize: 100,
  }),
  columnHelper.accessor("TaskUpdateTime", {
    header: "Last Updated",
    size: 140,
    minSize: 100,
  }),
  columnHelper.display({
    id: "actions",
    size: 40,
    minSize: 40,
  }),
];
