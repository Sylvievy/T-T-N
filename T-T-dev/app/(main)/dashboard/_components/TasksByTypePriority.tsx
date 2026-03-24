"use client";

import { useMemo } from "react";
import { TypePriority } from "@/services/dashboard/DashboardParams";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getColorForString } from "@/lib/ColourPalette";
import resolveCollisions from "@/lib/resolveCollisions";

interface Props {
  data: TypePriority[];
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#FF7E26",
  Medium: "#2986CC",
  Low: "#059669",
  // Critical: "#ff0000",
  // High: "#FF5F00",
  // Medium: "#FCBF49",
  // Low: "#2E7D32",
};
const TasksByTypePriority = ({ data }: Props) => {
  const { filters, setExclusiveFilter } = useDashboardFilters();

  const PriorityData = useMemo(() => {
    return data.reduce(
      (acc, curr) => {
        acc[curr.Priority] = (acc[curr.Priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [data]);

  const innerData = Object.keys(PriorityData).map((key) => ({
    name: key,
    value: PriorityData[key],
    color: PRIORITY_COLORS[key] ?? "#94a3b8",
  }));

  const typeData = data.reduce(
    (acc, curr) => {
      acc[curr.TaskType] = (acc[curr.TaskType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const outerData = Object.keys(typeData).map((key) => ({
    name: key,
    value: typeData[key],
  }));

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, outerRadius, name, value, index } = props;

    const pos = labelMap[index];
    if (!pos) return null;

    const color = getColorForString(name);

    const sx = cx + outerRadius * pos.cos;
    const sy = cy + outerRadius * pos.sin;

    const horizontalDist = value < 5 ? 10 : 6;
    const mx = cx + (outerRadius * 1.4 + horizontalDist) * pos.cos;

    const ey = cy + pos.ey;
    const my = ey;

    const drift = Math.abs(ey - (cy + pos.naturalEy));
    const extra = Math.min(drift * 0.1, 20);
    const ex = mx + (pos.cos >= 0 ? 3 : -3);
    const textAnchor = pos.cos >= 0 ? "start" : "end";

    return (
      <g
        onClick={() => setExclusiveFilter("type", name)}
        className="cursor-pointer group"
      >
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={color}
          strokeWidth={1.2}
          fill="none"
          className="group-hover:stroke-slate-900 transition-colors"
        />
        <text
          x={ex + (pos.cos >= 0 ? 8 : -8)}
          y={ey}
          textAnchor={textAnchor}
          fill="#475569"
          dominantBaseline="central"
          style={{
            fontSize: "11px",
            fontWeight: filters.type === name ? 700 : 400,
          }}
          className="group-hover:fill-slate-900 select-none transition-all"
        >
          {`${name} (${value})`}
        </text>
      </g>
    );
  };

  const labelMap = useMemo(() => {
    const total = outerData.reduce((s, d) => s + d.value, 0);
    const RADIAN = Math.PI / 180;
    let startAngle = 0;
    const left: any[] = [],
      right: any[] = [];

    outerData.forEach((entry, index) => {
      const angle = (entry.value / total) * 360;
      const midAngle = startAngle + angle / 2;
      startAngle += angle;

      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);

      const my = 120 * sin;
      const item = { index, midAngle, cos, sin, naturalEy: my, ey: my };

      if (cos >= 0) right.push(item);
      else left.push(item);
    });

    resolveCollisions(left, 14, 3);
    resolveCollisions(right, 14, 3);

    const map: Record<number, any> = {};
    [...left, ...right].forEach((e) => {
      map[e.index] = e;
    });
    return map;
  }, [outerData]);

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "11px",
              padding: "2px 6px",
            }}
          />
          <Pie
            data={innerData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="40%"
            style={{ cursor: "pointer", outline: "none" }}
            stroke="none"
            labelLine={false}
            onClick={(data) => setExclusiveFilter("priority", data.name)}
            label={(props) => {
              const { cx, cy, midAngle, innerRadius, outerRadius, name } =
                props;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text
                  x={x}
                  y={y}
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: "12px", pointerEvents: "none" }}
                >
                  {name}
                </text>
              );
            }}
          >
            {innerData.map((entry, index) => (
              <Cell key={`cell-inner-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Pie
            data={outerData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="65%"
            stroke="none"
            style={{ cursor: "pointer", outline: "none" }}
            label={renderCustomizedLabel}
            onClick={(data) => setExclusiveFilter("type", data.name)}
            labelLine={false}
          >
            {outerData.map((entry, index) => (
              <Cell
                key={`cell-outer-${index}`}
                fill={getColorForString(entry.name)}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksByTypePriority;
