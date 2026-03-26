"use client";

import { useState, useMemo } from "react";
import { ByUsers } from "@/services/dashboard/DashboardParams";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { getColorForString } from "@/lib/ColourPalette";
import { UserPagination } from "../../../../components/_dashboardcomponents/UserPagination";

interface Props {
  data: ByUsers[];
}

const TasksByUsers = ({ data }: Props) => {
  const { filters, setUserFilter, setFilter } = useDashboardFilters();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const itemsPerPage = 12;
  const taskTypes = Array.from(new Set(data.map((item) => item.TaskTypeName)));

  const processedData = useMemo(() => {
    const aggregated = data.reduce((acc, curr) => {
      let existing = acc.find((item) => item.username === curr.UserName);
      const taskCount = Number(curr.TotalTasks) || 0;

      if (!existing) {
        existing = { username: curr.UserName, total: 0 };
        taskTypes.forEach((type) => (existing![type] = 0));
        acc.push(existing);
      }
      existing[curr.TaskTypeName] =
        (existing[curr.TaskTypeName] || 0) + taskCount;
      existing.total += taskCount;
      return acc;
    }, [] as any[]);

    return aggregated.sort((a, b) =>
      sortOrder === "desc" ? b.total - a.total : a.total - b.total,
    );
  }, [data, sortOrder]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  // const globalMax = useMemo(() => {
  //   if (processedData.length === 0) return 0;
  //   const rawMax = Math.max(...processedData.map((item) => item.total));
  //   return rawMax === 0 ? 100 : Math.ceil(rawMax / 50) * 50;
  // }, [processedData]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex p-0 flex-row h-full w-full min-h-0">
        <div className="flex p-0 flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={paginatedData}
              layout="vertical"
              margin={{ top: 15, right: 60, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
              />
              <YAxis
                dataKey="username"
                type="category"
                width={100}
                tickLine={true}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 11, fill: "#0f172a", cursor: "pointer" }}
                onClick={(e: any) => {
                  if (e && e.value) {
                    const newUser = filters.user === e.value ? null : e.value;
                    setUserFilter(newUser, filters.type);
                  }
                }}
                tickFormatter={(value: string) => {
                  const words = value.split(" ");
                  return words.length > 1
                    ? `${words[0]}\u00A0${words[1]}`
                    : value;
                }}
              />
              <XAxis type="number" hide />

              {taskTypes.map((type, index) => {
                const barColor = getColorForString(type);
                return (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    barSize={15}
                    maxBarSize={30}
                    fill={barColor}
                    radius={
                      index === taskTypes.length - 1
                        ? [0, 4, 4, 0]
                        : [0, 0, 0, 0]
                    }
                    style={{ cursor: "pointer" }}
                    onClick={(payload: any) => {
                      if (
                        filters.user === payload.username &&
                        filters.type === type
                      ) {
                        setUserFilter(null, null);
                      } else {
                        setUserFilter(payload.username, type);
                      }
                    }}
                  >
                    {paginatedData.map((entry, idx) => {
                      const isUserMatch = filters.user === entry.username;
                      const isTypeMatch = filters.type === type;

                      let isHighlighted = false;

                      if (!filters.user && !filters.type) {
                        isHighlighted = true;
                      } else if (filters.user && filters.type) {
                        isHighlighted = isUserMatch && isTypeMatch;
                      } else if (filters.user) {
                        isHighlighted = isUserMatch;
                      } else if (filters.type) {
                        isHighlighted = isTypeMatch;
                      }

                      return (
                        <Cell
                          key={`cell-${idx}`}
                          fill={barColor}
                          fillOpacity={isHighlighted ? 1 : 0.08}
                          stroke={
                            isHighlighted && (filters.user || filters.type)
                              ? barColor
                              : "none"
                          }
                          strokeWidth={1}
                          className="transition-all duration-200"
                        />
                      );
                    })}
                    <LabelList
                      dataKey={type}
                      position="inside"
                      content={(props: any) => {
                        const {
                          x,
                          y,
                          width,
                          height,
                          value,
                          index: dataIndex,
                        } = props;
                        const entry = paginatedData[dataIndex];
                        const isUserMatch = filters.user === entry?.username;
                        const isTypeMatch = filters.type === type;

                        let isHighlighted = false;
                        if (!filters.user && !filters.type)
                          isHighlighted = true;
                        else if (filters.user && filters.type)
                          isHighlighted = isUserMatch && isTypeMatch;
                        else if (filters.user) isHighlighted = isUserMatch;
                        else if (filters.type) isHighlighted = isTypeMatch;

                        if (!value || value <= 0 || !isHighlighted) return null;

                        return (
                          <text
                            x={x + width / 2}
                            y={y + height / 2}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{
                              fontSize: "9px",
                              fontWeight: "700",
                              pointerEvents: "none",
                            }}
                          >
                            {value}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-[100px] border-l border-slate-100 pl-2 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">
            Categories
          </span>
          <div className="flex flex-col gap-2">
            {taskTypes.map((type) => {
              const isTypeActive = filters.type === type && !filters.user;
              return (
                <div
                  key={type}
                  onClick={() => {
                    const newType = filters.type === type ? null : type;
                    setUserFilter(filters.user, newType);
                  }}
                  className={`flex items-center gap-2 cursor-pointer group transition-all`}
                  style={{
                    opacity: filters.type && filters.type !== type ? 0.3 : 1,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: getColorForString(type) }}
                  />
                  <span
                    className={`text-[10px] truncate leading-none transition-colors ${
                      isTypeActive
                        ? "font-bold text-slate-900"
                        : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    {type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        sortOrder={sortOrder}
        onSortToggle={() => {
          setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
          setCurrentPage(0);
        }}
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={currentPage > 0}
        canNext={currentPage < totalPages - 1}
      />
    </div>
  );
};

export default TasksByUsers;
