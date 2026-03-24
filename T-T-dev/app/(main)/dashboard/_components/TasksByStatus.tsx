"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { TaskStatus } from "@/services/dashboard/DashboardParams";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";

interface Props {
  data: TaskStatus[];
}

const ALL_STATUSES = [
  "Assigned",
  "Accepted",
  "In Process",
  "In Review",
  "Prop'd Time",
  "Declined",
];

const STATUS_COLORS: Record<string, string> = {
  Assigned: "#AA2B1D",
  Accepted: "#051a39",
  "In Process": "#018036",
  "In Review": "#051a39",
  "Prop'd Time": "#AA2B1D",
  Declined: "#64748b",
};

const TasksByStatus = ({ data }: Props) => {
  const { filters, setExclusiveFilter } = useDashboardFilters();

  const initialData = ALL_STATUSES.map((status) => ({
    status,
    count: 0,
  }));

  const aggregatedData = data.reduce((acc, curr) => {
    const statusName =
      curr.StatusName === "Proposed New Time" ? "Prop'd Time" : curr.StatusName;

    const item = acc.find((i) => i.status === statusName);
    if (item) {
      item.count += 1;
    }
    return acc;
  }, initialData);

  const RenderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    const isSelected = filters.status === payload.value;

    return (
      <g
        transform={`translate(${x},${y})`}
        onClick={() => setExclusiveFilter("status", payload.value)}
        className="cursor-pointer group"
      >
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={isSelected ? "#0f172a" : "#475569"}
          style={{
            fontSize: "10px", // Slightly smaller to ensure fit
            fontWeight: isSelected ? 700 : 400,
            transition: "all 0.2s",
          }}
          className="group-hover:fill-slate-900"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={aggregatedData}
          margin={{ top: 20, right: 10, left: -25, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="status"
            axisLine={true}
            tickLine={false}
            interval={0} // Force show all labels even if they overlap
            tick={<RenderCustomTick />}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#475569" }}
            allowDecimals={false} // Since tasks are whole numbers
          />

          <Tooltip
            cursor={{ fill: "#f1f5f9", radius: 4 }}
            contentStyle={{
              borderRadius: "11px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              padding: "3px 8px",
              fontSize: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
            formatter={(value: number) => [value, "Tasks"]}
          />

          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            barSize={15}
            style={{ cursor: "pointer" }}
            onClick={(payload) => {
              if (payload && payload.status) {
                setExclusiveFilter("status", payload.status);
              }
            }}
          >
            {aggregatedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                fillOpacity={
                  !filters.status || filters.status === entry.status ? 1 : 0.4
                }
                stroke={filters.status === entry.status ? "#0f172a" : "none"}
                strokeWidth={1.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksByStatus;
